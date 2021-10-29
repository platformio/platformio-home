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

import { Icon, Table } from 'antd';
import {
  PARENT_DIR,
  compareBool,
  compareNumber,
  compareString,
  formatSize,
  multiSort,
  safeFormatSize,
} from '@inspect/helpers';

import { PathBreadcrumb } from './path-breadcrumb.jsx';
import PropTypes from 'prop-types';
import React from 'react';

const PARENT_ITEM_IDX = -1;
const PARENT_ITEM = Object.freeze({
  idx: PARENT_ITEM_IDX,
  isDir: true,
  relativePath: PARENT_DIR,
});

const FileItemType = PropTypes.shape({
  relativePath: PropTypes.string.isRequired,
  isDir: PropTypes.bool,
  ram: PropTypes.int,
  flash: PropTypes.int,
});

export const FileItemsType = PropTypes.arrayOf(FileItemType);

function sortDirFirst(a, b) {
  return compareBool(b.isDir, a.isDir);
}

export class MemoryDirExplorer extends React.PureComponent {
  static propTypes = {
    dir: PropTypes.string,
    items: FileItemsType,
    onDirChange: PropTypes.func.isRequired,
    onFileClick: PropTypes.func,
  };

  renderIcon(isDir) {
    return <Icon type={isDir ? 'folder-open' : 'file-text'} />;
  }

  getTableColumns() {
    return [
      {
        title: 'Name',
        dataIndex: 'relativePath',
        defaultSortOrder: 'ascend',
        render: (path, item) => (
          <a>
            {this.renderIcon(item.isDir)} {path.replace(/^\//, '')}
          </a>
        ),
        sorter: multiSort(sortDirFirst, (a, b) =>
          compareString(a.relativePath, b.relativePath)
        ),
        width: '100%',
      },
      {
        title: 'Flash',
        dataIndex: 'flash',
        render: (size) => <div className="text-nowrap">{safeFormatSize(size)}</div>,
        sorter: multiSort(sortDirFirst, (a, b) => compareNumber(a.flash, b.flash)),
        align: 'right',
      },
      {
        title: 'RAM',
        dataIndex: 'ram',
        render: (size) => <div className="text-nowrap">{safeFormatSize(size)}</div>,
        sorter: multiSort(sortDirFirst, (a, b) => compareNumber(a.ram, b.ram)),
        align: 'right',
      },
    ];
  }

  handleRowClick(e) {
    e.preventDefault();
    const tr = e.target.closest('tr');
    if (!tr) {
      return;
    }
    const { onDirChange, items, dir = '' } = this.props;
    const idx = parseInt(tr.dataset.rowKey);
    let path;
    if (idx === PARENT_ITEM_IDX) {
      const parts = dir.split('/');
      parts.pop();
      path = parts.join('/');
      if (path === '') {
        // ROOT dir
        path = undefined;
      }
    } else {
      const item = items[idx];
      if (dir.length) {
        path = `${dir}/${item.relativePath}`;
      } else {
        path = item.relativePath;
      }
      if (!item.isDir) {
        this.props.onFileClick(path);
        return;
      }
    }
    onDirChange(path);
  }

  handleBreadcrumbChange(path) {
    this.props.onDirChange(path);
  }

  render() {
    const { items, dir } = this.props;

    if (items.length === 0) {
      return (
        <ul className="background-message text-center">
          <li>No Items</li>
        </ul>
      );
    }
    return (
      <div>
        <PathBreadcrumb path={dir} onChange={::this.handleBreadcrumbChange} />
        {this.renderList()}
      </div>
    );
  }

  renderFooter(ds) {
    const total = ds.reduce(
      (acc, { ram, flash }) => {
        acc.ram += ram | 0;
        acc.flash += flash | 0;
        return acc;
      },
      { ram: 0, flash: 0 }
    );
    return (
      <div className="text-right">
        {`Total: ${formatSize(total.flash)} Flash, ${formatSize(total.ram)} RAM`}
      </div>
    );
  }

  renderList() {
    const { dir = '' } = this.props;
    const indexedItems = this.props.items.map((x, i) => ({ ...x, idx: i }));
    const ds = dir.length ? [PARENT_ITEM, ...indexedItems] : indexedItems;

    return (
      <Table
        childrenColumnName="_"
        columns={this.getTableColumns()}
        dataSource={ds}
        footer={::this.renderFooter}
        onRow={() => ({ onClick: ::this.handleRowClick })}
        pagination={false}
        rowKey="idx"
        size="middle"
      />
    );
  }
}
