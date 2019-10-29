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

import { Table, Tag, Tooltip } from 'antd';
import {
  columnSortFactory,
  getFilterMenu,
  limitPathLength,
  multiSort
} from '@inspect/helpers';

import { DefectType } from '@inspect/types';
import PropTypes from 'prop-types';
import React from 'react';
import { SEVERITY_LEVEL_NAME } from '@inspect/constants';

export class CodeDefects extends React.PureComponent {
  static propTypes = {
    defects: PropTypes.arrayOf(DefectType),
    osOpenUrl: PropTypes.func.isRequired,
    openTextDocument: PropTypes.func.isRequired
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

  renderMessage(message, defect) {
    return (
      <span>
        {defect.cwe && (
          <a
            style={{ marginRight: 5 }}
            onClick={() =>
              this.props.osOpenUrl(
                `https://cwe.mitre.org/data/definitions/${defect.cwe}.html`
              )
            }
          >
            CWE-{defect.cwe}:
          </a>
        )}
        {defect.id ? (
          <Tooltip title={`${defect.tool} defect ID: ${defect.id}`}>{message}</Tooltip>
        ) : (
          message
        )}
      </span>
    );
  }

  getTableColumns(ds) {
    return [
      {
        title: 'Tool',
        dataIndex: 'tool',
        filters: getFilterMenu(ds, 'tool'),
        onFilter: (value, record) => record.tool === value,
        sorter: columnSortFactory('string', 'tool'),
        align: 'center'
      },
      {
        title: 'Level',
        dataIndex: 'level',
        defaultSortOrder: 'ascend',
        filters: Object.entries(SEVERITY_LEVEL_NAME).map(([value, text]) => ({
          text,
          value: parseInt(value)
        })),
        onFilter: (value, record) => record.level === value,
        render: CodeDefects.renderSeverityLevel,
        sorter: columnSortFactory('number', 'level'),
        align: 'center'
      },
      {
        title: 'Category',
        dataIndex: 'category',
        filters: getFilterMenu(ds, 'category'),
        onFilter: (value, record) => record.category === value,
        render: category => <Tag>{category.toUpperCase()}</Tag>,
        sorter: columnSortFactory('string', 'category'),
        align: 'center'
      },
      {
        title: 'Message',
        dataIndex: 'message',
        sorter: columnSortFactory('string', 'message'),
        render: ::this.renderMessage
      },
      {
        title: 'Location',
        dataIndex: 'file',
        render: (file, { line, column }) => (
          <a onClick={() => this.props.openTextDocument(file, line, column)}>
            <Tooltip title={file}>
              {limitPathLength(file, 25)}:{line}:{column}
            </Tooltip>
          </a>
        ),
        sorter: multiSort(
          columnSortFactory('string', 'file'),
          columnSortFactory('number', 'line'),
          columnSortFactory('number', 'column')
        )
      }
    ];
  }

  render() {
    const { defects } = this.props;
    const ds = defects.map((x, i) => ({ ...x, idx: i }));
    return (
      <div className="page-container">
        <Table
          childrenColumnName="_"
          columns={this.getTableColumns(ds)}
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
