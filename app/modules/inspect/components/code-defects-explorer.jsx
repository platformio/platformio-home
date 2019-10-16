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

import { Icon, Table } from 'antd';
import { compareNumber, compareString, multiSort } from '@inspect/helpers';

import PropTypes from 'prop-types';
import React from 'react';

export const DefectsType = PropTypes.arrayOf(
  PropTypes.shape({
    category: PropTypes.string.isRequired,
    column: PropTypes.number.isRequired,
    file: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    line: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    tool: PropTypes.string.isRequired
  })
);

const SEVERITY_ICON = {
  low: {
    color: '#1890ff',
    type: 'info-circle'
  },
  medium: {
    color: '#fadb14',
    type: 'warning'
  },
  high: {
    color: '#f5222d',
    type: 'close-circle'
  }
};

export class CodeDefectsExplorer extends React.PureComponent {
  static propTypes = {
    defects: DefectsType
  };

  constructor(...args) {
    super(...args);

    this.state = {
      search: ''
    };
  }

  static renderSeverityIcon(severity) {
    const cfg = SEVERITY_ICON[severity];
    return cfg && <Icon style={{ color: cfg.color }} type={cfg.type} />;
  }

  getTableColumns() {
    return [
      {
        align: 'center',
        title: '',
        dataIndex: 'severity',
        defaultSortOrder: 'descend',
        render: CodeDefectsExplorer.renderSeverityIcon,

        sorter: (a, b) => compareString(a.severity, b.severity),
        width: 30
      },
      {
        title: 'Message',
        dataIndex: 'message',
        sorter: (a, b) => compareNumber(a.message, b.message)
      },
      {
        title: 'Location',
        dataIndex: 'file',
        sorter: (a, b) => compareString(a.file, b.file),

        width: '25%'
      },
      {
        title: 'Error ID',
        dataIndex: 'id',
        render: (errorId, { tool, line, column }) =>
          `${tool}(${errorId}) [${line}:${column}]`,
        sorter: multiSort(
          (a, b) => compareString(a.id, b.id),
          (a, b) => compareNumber(a.line, b.line),
          (a, b) => compareNumber(a.column, b.column)
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

  renderFooter = () => {
    return <div style={{ textAlign: 'right' }}>TODO</div>;
  };
}
