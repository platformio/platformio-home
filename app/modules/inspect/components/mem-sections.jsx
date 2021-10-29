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

import { Table, Tag } from 'antd';
import {
  compareNumber,
  compareString,
  formatHex,
  formatSize,
  getFilterMenu,
} from '@inspect/helpers';

import React from 'react';
import { SectionsType } from '@inspect/types';

export class MemorySections extends React.PureComponent {
  static propTypes = {
    sections: SectionsType,
  };

  constructor(...args) {
    super(...args);

    this.state = {
      search: '',
    };
  }

  renderAddress = (addr) => (
    <code>{formatHex(addr, { width: this.addressWidth })}</code>
  );

  getTableColumns(ds) {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        defaultSortOrder: 'ascend',
        sorter: (a, b) => compareString(a.name, b.name),
        width: '100%',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        filters: getFilterMenu(ds, 'type'),
        onFilter: (value, record) => record.type === value,
        render: (type) => <Tag>{type}</Tag>,
        sorter: (a, b) => compareString(a.type, b.type),
        align: 'center',
      },
      {
        title: 'Flags',
        dataIndex: 'flags',
        filters: getFilterMenu(ds, 'flags'),
        onFilter: (value, record) => record.flags === value,
        render: (flags) => flags.length !== 0 && <Tag>{flags}</Tag>,
        sorter: (a, b) => compareString(a.flags, b.flags),
        align: 'center',
      },
      {
        title: 'Address',
        dataIndex: 'startAddr',
        render: this.renderAddress,
        sorter: (a, b) => compareNumber(a.startAddr, b.startAddr),
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
      <div>
        <Table
          childrenColumnName="_"
          columns={this.getTableColumns(ds)}
          dataSource={ds}
          footer={::this.renderFooter}
          pagination={{
            defaultPageSize: 20,
            hideOnSinglePage: true,
          }}
          rowKey="idx"
          size="middle"
        />
      </div>
    );
  }

  renderFooter(ds) {
    const totalSize = ds.reduce((total, { size = 0 }) => {
      return total + size;
    }, 0);
    return (
      <div className="text-right">{`Total Size on Page: ${formatSize(totalSize)}`}</div>
    );
  }
}
