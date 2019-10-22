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

import { Table, Tag, Tooltip } from 'antd';
import { columnSortFactory, limitPathLength, multiSort } from '@inspect/helpers';

import { DefectType } from '@inspect/types';
import PropTypes from 'prop-types';
import React from 'react';
import { SEVERITY_LEVEL_NAME } from '@inspect/constants';

export class CodeDefects extends React.PureComponent {
  static propTypes = {
    defects: PropTypes.arrayOf(DefectType)
  };

  constructor(...args) {
    super(...args);

    this.state = {
      search: ''
    };
  }

  static renderSeverityLevel(level) {
    const name = SEVERITY_LEVEL_NAME[level];
    return (
      <Tag className={`severity-tag severity-${name.toLowerCase()}`}>
        {name.toUpperCase()}
      </Tag>
    );
  }

  static renderLocation(file, { line, column }) {
    return (
      <Tooltip title={`${file}:${line}:${column}`}>{`${limitPathLength(
        file,
        50
      )}:${line}:${column}`}</Tooltip>
    );
  }

  getTableColumns() {
    return [
      {
        align: 'center',
        title: 'Analyzer',
        dataIndex: 'tool',
        sorter: columnSortFactory('string', 'tool'),
        width: 100
      },
      {
        align: 'center',
        title: 'Level',
        dataIndex: 'level',
        defaultSortOrder: 'descend',
        render: CodeDefects.renderSeverityLevel,
        sorter: columnSortFactory('number', 'level'),
        width: 80
      },
      {
        title: 'Message',
        dataIndex: 'message',
        sorter: columnSortFactory('string', 'message')
      },
      {
        title: 'Location',
        dataIndex: 'file',
        render: CodeDefects.renderLocation,
        sorter: multiSort(
          columnSortFactory('string', 'file'),
          columnSortFactory('number', 'line'),
          columnSortFactory('number', 'column')
        ),
        width: '25%'
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
    const { defects } = this.props;

    const ds = defects.map((x, i) => ({ ...x, idx: i }));
    this.addressWidth = this.getMaxStartAddressWidth(ds);

    return (
      <div className="page-container">
        <Table
          childrenColumnName="_"
          columns={this.getTableColumns()}
          dataSource={ds}
          pagination={{
            defaultPageSize: 15,
            hideOnSinglePage: true
          }}
          rowKey="idx"
          size="middle"
        />
      </div>
    );
  }
}
