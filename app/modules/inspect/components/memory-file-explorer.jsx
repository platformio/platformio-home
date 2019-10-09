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

// import * as pathlib from '@core/path';

import { Icon, Table, Tag } from 'antd';
import { compareNumber, compareString, formatHex, formatSize } from '@inspect/helpers';

import { PathBreadcrumb } from './path-breadcrumb.jsx';
import PropTypes from 'prop-types';
import React from 'react';

const SymbolType = PropTypes.shape({
  addr: PropTypes.number.isRequired,
  bind: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  demangled_name: PropTypes.string,
  location: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  section: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired
});

const FileItemType = PropTypes.shape({
  path: PropTypes.string.isRequired,
  isDir: PropTypes.bool,
  ram: PropTypes.number,
  flash: PropTypes.number,
  symbols: PropTypes.arrayOf(SymbolType)
});

export class MemoryFileExplorer extends React.PureComponent {
  static propTypes = {
    file: FileItemType,
    onDirChange: PropTypes.func
  };

  static iconsMap = Object.freeze({
    STT_FUNC: 'profile',
    STT_OBJECT: 'tag'
  });

  renderIcon(type) {
    const icon = MemoryFileExplorer.iconsMap[type];
    return icon && <Icon type={icon} />;
  }

  renderDisplayName = (displayName, item) => (
    <span>
      {this.renderIcon(item.type)} {displayName}
    </span>
  );

  renderAddress = addr => <code>{formatHex(addr, { width: this.addressWidth })}</code>;

  getTableColumns() {
    return [
      {
        title: 'Name',
        dataIndex: 'displayName',
        defaultSortOrder: 'ascend',
        render: this.renderDisplayName,
        sorter: (a, b) => compareString(a.displayName, b.displayName)
      },
      {
        align: 'right',
        title: 'Address',
        dataIndex: 'addr',
        render: this.renderAddress,
        sorter: (a, b) => compareNumber(a.addr, b.addr),
        width: 150
      },
      {
        title: 'Section',
        dataIndex: 'section',
        render: section => <Tag>{section}</Tag>,
        sorter: (a, b) => compareString(a.section, b.section),
        width: 150
      },
      {
        align: 'right',
        title: 'Size',
        dataIndex: 'size',
        render: formatSize,
        sorter: (a, b) => compareNumber(a.size, b.size),
        width: 100
      }
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

  handleBreadcrumbChange = path => {
    this.props.onDirChange(path);
  };

  render() {
    const { file } = this.props;
    const ds = file.symbols;

    this.addressWidth = this.getMaxAddressWidth(ds);

    return (
      <div className="page-container">
        <PathBreadcrumb path={file.path} onChange={this.handleBreadcrumbChange} />
        <Table
          childrenColumnName="_"
          columns={this.getTableColumns()}
          dataSource={ds}
          footer={this.renderFooter}
          pagination={{
            defaultPageSize: 20,
            hideOnSinglePage: true
          }}
          rowKey="idx"
          size="middle"
        />
      </div>
    );
  }

  renderFooter = ds => {
    const totalSize = ds.reduce((total, { size = 0 }) => {
      return total + size;
    }, 0);
    return (
      <div style={{ textAlign: 'right' }}>{`Total Size on Page: ${formatSize(
        totalSize
      )}`}</div>
    );
  };
}