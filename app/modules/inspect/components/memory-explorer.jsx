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

const PARENT_ITEM_IDX = -1;
const PARENT_ITEM = {
  idx: PARENT_ITEM_IDX,
  isDir: true,
  relativePath: pathlib.PARENT_DIR,
};
Object.freeze(PARENT_ITEM);

const FileItemType = PropTypes.shape({
  relativePath: PropTypes.string.isRequired,
  isDir: PropTypes.bool,
  ramSize: PropTypes.int,
  flashSize: PropTypes.int
});

export const FileItemsType = PropTypes.arrayOf(FileItemType);

export class MemoryExplorer extends React.PureComponent {

  static propTypes = {
    dir: PropTypes.string.isRequired,
    items: FileItemsType,
    onDirChange: PropTypes.func.isRequired
  }

  getTableColumns() {
    return [
      {
        title: '',
        dataIndex: 'isDir',
        render: (children) => <Icon type={children ? 'folder-open' : 'file-text'}/>,
        // 14px icon + 8px*2 padding
        width: 30
      },
      {
        title: 'Name',
        dataIndex: 'relativePath',
        render: (path, item) => {
          if (item.isDir || name == pathlib.PARENT_DIR) {
            return <a>{path}</a>;
          }
          return path;
        }
      },
      {
        title: 'Flash Size',
        dataIndex: 'flashSize',
        width: 100
      },
      {
        title: 'RAM Size',
        dataIndex: 'ramSize',
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
        path = '';
      }
    } else {
      const item = items[idx];
      if (!item.isDir)  {
        return;
      }
      if (!dir.length) {
        path = item.relativePath;
      } else {
        path = pathlib.join(dir, item.relativePath);
      }
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
       onDirChange('');
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
    return (<Breadcrumb>
          <Breadcrumb.Item key={0} >
            <a
              title={'/'}
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

  renderList() {
    const {dir} = this.props;
    const indexedItems = this.props.items.map((x, i) => ({...x, idx: i}));
    const ds = dir.length ? [PARENT_ITEM, ...indexedItems] : indexedItems;

    return (<Table
        childrenColumnName='_'
        columns={ this.getTableColumns() }
        dataSource={ds}
        onRow={() => ({ onClick: this.handleRowClick })}
        pagination={false}
        rowKey='idx'
        size='middle'
        />
      );
  }
}
