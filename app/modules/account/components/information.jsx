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

import { Divider, Icon, Table, Tag, Tooltip } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import humanize from 'humanize';

export default class AccountInformation extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      username: PropTypes.string.isRequired,
      groups: PropTypes.array,
      subscriptions: PropTypes.array,
      currentPlan: PropTypes.string
    }).isRequired,
    logoutAccount: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <div>
          <h1>General</h1>
          <dl className="dl-horizontal">
            <dt>Logged in as</dt>
            <dd>
              {this.props.data.username} ({' '}
              <a onClick={() => this.props.logoutAccount()}>Log out</a> )
            </dd>
            <dt>PIO Plus Plan</dt>
            <dd>
              <a
                onClick={() =>
                  this.props.osOpenUrl(
                    'https://platformio.org/pricing?utm_campaign=account-info'
                  )
                }
                className="inline-block"
              >
                {this.props.data.currentPlan}
              </a>
            </dd>
          </dl>
        </div>
        {this.renderSubscriptions()}
        {this.renderGroups()}
      </div>
    );
  }

  renderSubscriptions() {
    if (!this.props.data.subscriptions || !this.props.data.subscriptions.length) {
      return;
    }
    const columns = [
      {
        title: 'Plan',
        dataIndex: 'product_name',
        key: 'product_name'
      },
      {
        title: 'Start Date',
        dataIndex: 'begin_time',
        key: 'begin_time',
        render: text => (
          <Tooltip title={new Date(parseInt(text) * 1000).toString()}>
            {humanize.date('F j, Y', parseInt(text))}
          </Tooltip>
        )
      },
      {
        title: 'End Date',
        dataIndex: 'end_time',
        key: 'end_time',
        render: text => (
          <Tooltip
            title={parseInt(text) ? new Date(parseInt(text) * 1000).toString() : ''}
          >
            {parseInt(text) ? humanize.date('F j, Y', parseInt(text)) : '-'}
          </Tooltip>
        )
      },
      {
        title: 'Next Payment',
        dataIndex: 'next_bill_time',
        key: 'next_bill_time',
        render: text => (
          <Tooltip title={new Date(parseInt(text) * 1000).toString()}>
            {humanize.date('F j, Y', parseInt(text))}
          </Tooltip>
        )
      },
      {
        title: 'State',
        dataIndex: 'status',
        key: 'status',
        render: text => (
          <Tag color={text == 'active' ? '#87d068' : '#f5222d'}>{text}</Tag>
        )
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) =>
          record.status === 'active' && (
            <span>
              <a onClick={() => this.props.osOpenUrl(record.update_url)}>Edit</a>{' '}
              <Divider type="vertical" />{' '}
              <a onClick={() => this.props.osOpenUrl(record.cancel_url)}>Cancel</a>
            </span>
          )
      }
    ];
    return (
      <div>
        <h1>Subscriptions</h1>
        <Table
          columns={columns}
          dataSource={this.props.data.subscriptions}
          pagination={false}
        />
        <br />
      </div>
    );
  }

  renderGroups() {
    return (
      <div>
        <h1>Groups</h1>
        {this.props.data.groups &&
          this.props.data.groups.map(group => (
            <dl key={group.name} className="dl-horizontal">
              <dt>Name</dt>
              <dd>{group.name}</dd>
              <dt>Expires</dt>
              <dd>
                <Tooltip
                  title={group.expire ? new Date(group.expire * 1000).toString() : ''}
                >
                  {group.expire ? humanize.date('F j, Y', group.expire) : 'never'}
                </Tooltip>
              </dd>
              <dt>Permissions</dt>
              <dd>
                <ul>
                  {group.permissions.map(permissionName => (
                    <li key={permissionName}>
                      <Icon type="check" />
                      {' ' + permissionName}
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
          ))}
      </div>
    );
  }
}
