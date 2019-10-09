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

import { Table, Tag } from 'antd';
import { compareNumber, compareString, formatHex, formatSize } from '@inspect/helpers';

import PropTypes from 'prop-types';
import React from 'react';

const SectionsType = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string,
    flags: PropTypes.string,
    size: PropTypes.number,
    startAddr: PropTypes.number,
    type: PropTypes.string
  })
);

export class MemorySectionsExplorer extends React.PureComponent {
  static propTypes = {
    sections: SectionsType
  };

  constructor(...args) {
    super(...args);

    this.state = {
      search: ''
    };
  }

  renderAddress = addr => <code>{formatHex(addr, { width: this.addressWidth })}</code>;

  getTableColumns() {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        defaultSortOrder: 'ascend',
        sorter: (a, b) => compareString(a.name, b.name)
      },
      {
        title: 'Type',
        dataIndex: 'type',
        render: type => <Tag>{type}</Tag>,
        sorter: (a, b) => compareString(a.type, b.type),
        width: 150
      },
      {
        title: 'Flags',
        dataIndex: 'flags',
        render: flags => flags.length !== 0 && <Tag>{flags}</Tag>,
        sorter: (a, b) => compareString(a.flags, b.flags),
        width: 100
      },
      {
        align: 'right',
        title: 'Address',
        dataIndex: 'startAddr',
        render: this.renderAddress,
        sorter: (a, b) => compareNumber(a.startAddr, b.startAddr),
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

  getMaxStartAddressWidth(items) {
    let i = items.length;
    let maxAddr = 0;
    while (i--) {
      const { startAddr } = items[i];
      if (maxAddr < startAddr) {
        maxAddr = startAddr;
      }
    }
    return maxAddr.toString(16).length;
  }

  render() {
    const { sections } = this.props;

    const ds = sections.map((x, i) => ({ ...x, idx: i }));
    this.addressWidth = this.getMaxStartAddressWidth(ds);

    return (
      <div className="page-container">
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
