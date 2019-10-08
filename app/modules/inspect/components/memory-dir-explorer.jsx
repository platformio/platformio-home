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

import * as pathlib from '@core/path';

import { Breadcrumb, Icon, Table } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import humanize  from 'humanize';

const PARENT_ITEM_IDX = -1;
const PARENT_ITEM = Object.freeze({
  idx: PARENT_ITEM_IDX,
  isDir: true,
  relativePath: pathlib.PARENT_DIR,
});

const FileItemType = PropTypes.shape({
  relativePath: PropTypes.string.isRequired,
  isDir: PropTypes.bool,
  ram: PropTypes.int,
  flash: PropTypes.int
});

export const FileItemsType = PropTypes.arrayOf(FileItemType);

const formatSize = size => humanize.filesize(
  size,
  1024,
  size % 1024 === 0 || size < 1024 ? 0 : 1
);
const safeFormatSize = size => size !== undefined ? formatSize(size) : '';

function compareNumber(a, b) {
  return a - b;
}

function compareString(a ,b) {
  return String(a).localeCompare(b, undefined, {
    caseFirst: 'upper',
    numeric: true,
  });
}

function compareBool(a, b) {
  return a - b;
}

function sortDirFirst(a, b) {
  return compareBool(b.isDir, a.isDir);
}

function multiSort(...sorters) {
  return function(a, b) {
    for (let i = 0; i < sorters.length; i++) {
      const result = sorters[i](a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };

}

export class MemoryDirExplorer extends React.PureComponent {

  static propTypes = {
    dir: PropTypes.string.isRequired,
    items: FileItemsType,
    onDirChange: PropTypes.func.isRequired
  }

  renderIcon(isDir) {
    return (<Icon type={isDir ? 'folder-open' : 'file-text'} />);
  }

  getTableColumns() {
    return [
      {
        title: 'Name',
        dataIndex: 'relativePath',
        defaultSortOrder: 'ascend',
        render: (path, item) => {
          const { isDir } = item;
          const icon = this.renderIcon(isDir);
          if (isDir) {
            return <a>{icon} {path}</a>;
          }
          return <span>{icon} {path}</span>;
        },
        sorter: multiSort(
          sortDirFirst,
          (a, b) => compareString(a.relativePath, b.relativePath)
        ),
      },
      {
        title: 'Flash',
        dataIndex: 'flash',
        render: safeFormatSize,
        sorter: multiSort(
          sortDirFirst,
          (a, b) => compareNumber(a.flash, b.flash)
        ),
        width: 100
      },
      {
        title: 'RAM',
        dataIndex: 'ram',
        render: safeFormatSize,
        sorter: multiSort(
          sortDirFirst,
          (a, b) => compareNumber(a.ram, b.ram)
        ),
        width: 100
      }
    ];
  }

  handleRowClick = (e) => {
    e.preventDefault();
    const tr = e.target.closest('tr');
    if (!tr) {
      return;
    }
    const { onDirChange, items, dir } = this.props;
    const idx = parseInt(tr.dataset.rowKey);
    let path;
    if (idx === PARENT_ITEM_IDX) {
      path = pathlib.dirname(dir);
      if (path === dir) {
        path = pathlib.ROOT_DIR;
      }
    } else {
      const item = items[idx];
      if (!item.isDir)  {
        return;
      }
      path = pathlib.join(dir, item.relativePath);
    }
    onDirChange(path);
   }

   handleBreadCrumbItemClick = (e) => {
     e.preventDefault();
     const a = e.target.closest('a');
     if (!a) {
       return;
     }
     const { dir, onDirChange} = this.props;
     const idx = parseInt(a.dataset.idx);
     if (idx === 0) {
       onDirChange(pathlib.ROOT_DIR);
       return;
     }

    const path = pathlib.join(...pathlib.split(dir).slice(0, idx));
    onDirChange(path);
   }

  render() {
    const { items } = this.props;

    if (items.length === 0) {
      return (
        <ul className='background-message text-center'>
          <li>
            No Items
          </li>
        </ul>
        );
    }
    return (
      <div className='page-container'>
        {this.renderBreadCrumb()}
        {this.renderList()}
      </div>
      );
  }

  renderBreadCrumb() {
    return (<Breadcrumb className="block">
          <Breadcrumb.Item key={0} >
            <a
              title={pathlib.ROOT_DIR}
              data-idx={0}
              onClick={this.handleBreadCrumbItemClick}
            >
              <Icon type="book"/>
            </a>
          </Breadcrumb.Item>
          {
            pathlib.split(this.props.dir)
              .map((name, i) => (
                <Breadcrumb.Item key={i+1}>
                  <a
                    data-idx={i+1}
                    onClick={this.handleBreadCrumbItemClick}
                  >{name}</a>
                </Breadcrumb.Item>))
          }
        </Breadcrumb>);
  }

  getRowProps = () =>  ({ onClick: this.handleRowClick })

  renderFooter = (ds) => {
    const { ram, flash } = ds.reduce((acc, { ram, flash }) => {
      acc.ram += ram | 0;
      acc.flash += flash | 0;
      return acc;
    }, { ram: 0, flash: 0 });
    return (
      <div style={{textAlign: 'right'}}>
        {`Total: ${formatSize(flash)} Flash, ${formatSize(ram)} RAM`}
      </div>
    );
  }

  renderList() {
    const {dir} = this.props;
    const indexedItems = this.props.items
      .map((x, i) => ({...x, idx: i}));
    const ds = dir === pathlib.ROOT_DIR ? indexedItems : [PARENT_ITEM, ...indexedItems];

    return (<Table
        childrenColumnName='_'
        columns={ this.getTableColumns() }
        dataSource={ds}
        footer={this.renderFooter}
        onRow={this.getRowProps}
        pagination={false}
        rowKey='idx'
        size='middle'
        />
      );
  }
}
