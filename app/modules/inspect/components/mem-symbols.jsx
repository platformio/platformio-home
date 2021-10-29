/**
 * Copyright (c) 2014-present PlatformIO <contact@platformio.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Icon, Input, Table, Tag, Tooltip } from 'antd';
import {
  compareNumber,
  compareString,
  formatHex,
  formatSize,
  getFilterMenu,
  multiSort,
} from '@inspect/helpers';

import { PathBreadcrumb } from './path-breadcrumb';
import PropTypes from 'prop-types';
import React from 'react';
import { SYMBOL_ICON_BY_TYPE } from '@inspect/constants';
import { SymbolType } from '@inspect/types';

const typeToOrder = {
  STT_FUNC: 1,
  STT_OBJECT: 2,
};

function sortFunctionsFirst(a, b) {
  return compareNumber(typeToOrder[a.type] || 0, typeToOrder[b.type] || 0);
}

export class MemorySymbols extends React.PureComponent {
  static propTypes = {
    symbols: PropTypes.arrayOf(SymbolType),
    openTextDocument: PropTypes.func.isRequired,
    file: PropTypes.string,
    onDirChange: PropTypes.func,
  };

  constructor(...args) {
    super(...args);

    this.state = {
      search: '',
    };
  }

  componentDidMount() {
    if (this.searchEl) {
      this.searchEl.focus();
    }
  }

  renderIcon(type) {
    const icon = SYMBOL_ICON_BY_TYPE[type];
    return icon && <Icon type={icon} />;
  }

  renderDisplayName(displayName, item) {
    if (!item.file) {
      return (
        <span>
          {this.renderIcon(item.type)} {displayName}
        </span>
      );
    }
    return (
      <span>
        {this.renderIcon(item.type)} {displayName}{' '}
        <Tooltip
          placement="right"
          title={`at ${item.file}:${item.line}`}
          overlayStyle={{ maxWidth: 400 }}
        >
          <a onClick={() => this.props.openTextDocument(item.file, item.line)}>
            <Icon type="search" className="open-document-icon" />
          </a>
        </Tooltip>
      </span>
    );
  }

  renderAddress = (addr) => (
    <code>{formatHex(addr, { width: this.addressWidth })}</code>
  );

  getTableColumns(ds) {
    return [
      {
        title: 'Name',
        dataIndex: 'displayName',
        // Commented because it's very slow on big projects
        // defaultSortOrder: 'ascend',
        render: ::this.renderDisplayName,
        sorter: multiSort(sortFunctionsFirst, (a, b) =>
          compareString(a.displayName, b.displayName)
        ),
        width: '100%',
      },
      {
        title: 'Type',
        align: 'center',
        dataIndex: 'type',
        render: (text) => <Tag>{text}</Tag>,
        filters: getFilterMenu(ds, 'type'),
        onFilter: (type, record) => record.type.includes(type),
        sorter: (a, b) => compareString(a.type, b.type),
      },
      {
        title: 'Bind',
        align: 'center',
        dataIndex: 'bind',
        render: (text) => <Tag>{text}</Tag>,
        filters: getFilterMenu(ds, 'bind'),
        onFilter: (bind, record) => record.bind.includes(bind),
        sorter: (a, b) => compareString(a.bind, b.bind),
      },
      {
        title: 'Address',
        dataIndex: 'addr',
        render: this.renderAddress,
        sorter: (a, b) => compareNumber(a.addr, b.addr),
        align: 'center',
      },
      {
        title: 'Section',
        dataIndex: 'section',
        render: (text) => <Tag>{text}</Tag>,
        filters: getFilterMenu(ds, 'section'),
        onFilter: (section, record) => record.section === section,
        sorter: (a, b) => compareString(a.section, b.section),
        align: 'center',
      },
      {
        title: 'Size',
        dataIndex: 'size',
        render: (size) => <div className="text-nowrap">{formatSize(size)}</div>,
        sorter: (a, b) => compareNumber(a.size, b.size),
        align: 'right',
      },
    ];
  }

  getMaxAddressWidth(items) {
    let i = items.length;
    let maxAddr = 0;
    while (i--) {
      const { addr } = items[i];
      if (maxAddr < addr) {
        maxAddr = addr;
      }
    }
    return maxAddr.toString(16).length;
  }

  getSearchResults() {
    const { symbols } = this.props;
    const { search } = this.state;

    if (!search.length) {
      return symbols;
    }

    const stopWords = ['0', '0x'];
    const textFields = ['name', 'demangled_name', 'section'];
    const tokens = search
      .match(/\S+/g)
      .filter((token) => !stopWords.includes(token))
      .map((token) => {
        if (!isNaN(token)) {
          return token.toLowerCase();
        }
        return token;
      });

    return symbols.filter((symbol) => {
      for (const token of tokens) {
        let foundToken = false;
        if (!isNaN(token)) {
          const hexAddr = formatHex(symbol.addr).toLowerCase();
          if (hexAddr.startsWith(token) || hexAddr.endsWith(token.replace('0x', ''))) {
            foundToken = true;
          }
        } else {
          for (const name of textFields) {
            if (symbol[name] && symbol[name].includes(token)) {
              foundToken = true;
              break;
            }
          }
        }
        if (!foundToken) {
          return false;
        }
      }
      return true;
    });
  }

  handleBreadcrumbChange = (path) => {
    this.props.onDirChange(path);
  };

  handleSearch = (search) => {
    this.setState({
      search,
    });
  };

  render() {
    const { file } = this.props;

    const ds = this.getSearchResults()
      .map((x, i) => ({ ...x, idx: i }))
      .sort(sortFunctionsFirst);
    this.addressWidth = this.getMaxAddressWidth(ds);

    return (
      <div className="inspect-mem-symbols">
        <div className="block">
          <Input.Search
            allowClear
            enterButton
            // FIXME: need debounce to enable
            // onChange={this.handleSearch}
            onSearch={this.handleSearch}
            placeholder='Search, for ex. "init 0x80 bss"'
            ref={(el) => {
              this.searchEl = el;
            }}
            size="large"
            title="Looks inside name, section; start/end of address"
          />
        </div>
        {file && <PathBreadcrumb path={file} onChange={this.handleBreadcrumbChange} />}
        <Table
          childrenColumnName="_"
          columns={this.getTableColumns(ds)}
          dataSource={ds}
          footer={this.renderFooter}
          pagination={{
            defaultPageSize: 15,
            hideOnSinglePage: true,
          }}
          rowKey="idx"
          size="middle"
        />
      </div>
    );
  }

  renderFooter = (ds) => {
    const totalSize = ds.reduce((total, { size = 0 }) => {
      return total + size;
    }, 0);
    return (
      <div className="text-right">{`Total Size on Page: ${formatSize(totalSize)}`}</div>
    );
  };
}
