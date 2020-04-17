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
      profile: PropTypes.shape({
        username: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        firstname: PropTypes.string,
        lastname: PropTypes.string
      }).isRequired,
      packages: PropTypes.array,
      subscriptions: PropTypes.array
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
              {this.props.data.profile.username} ({' '}
              <a onClick={() => this.props.logoutAccount()}>Log out</a> )
            </dd>
            <dt>Email</dt>
            <dd>{this.props.data.profile.email}</dd>
            <dt>Full Name</dt>
            <dd>
              {this.props.data.profile.firstname} {this.props.data.profile.lastname}
            </dd>
          </dl>
        </div>
        {this.renderSubscriptions()}
        {this.renderPackages()}
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
        dataIndex: 'begin_at',
        key: 'begin_at',
        render: text => (
          <Tooltip title={new Date(text).toString()}>
            {humanize.date('F j, Y', new Date(text))}
          </Tooltip>
        )
      },
      {
        title: 'End Date',
        dataIndex: 'end_at',
        key: 'end_at',
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
        dataIndex: 'next_bill_at',
        key: 'next_bill_at',
        render: text => (
          <Tooltip title={new Date(text).toString()}>
            {humanize.date('F j, Y', new Date(text))}
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

  renderPackages() {
    return (
      <div>
        <h1>Packages</h1>
        {this.props.data.packages &&
          this.props.data.packages.map(item => (
            <dl key={item.name} className="dl-horizontal">
              <dt>Name</dt>
              <dd>{item.name}</dd>
              <dt>Expires</dt>
              <dd>
                <Tooltip
                  title={
                    item.subscription &&
                    (item.subscription.end_at || item.subscription.next_bill_at)
                      ? new Date(
                          item.subscription.end_at || item.subscription.next_bill_at
                        ).toString()
                      : ''
                  }
                >
                  {item.subscription &&
                  (item.subscription.end_at || item.subscription.next_bill_at)
                    ? humanize.date(
                        'F j, Y',
                        new Date(
                          item.subscription.end_at || item.subscription.next_bill_at
                        )
                      )
                    : 'never'}
                </Tooltip>
              </dd>
              <dt>Services</dt>
              <dd>
                <ul>
                  {Object.keys(item).map(key => {
                    if (!key.startsWith('service.')) {
                      return null;
                    }
                    return (
                      <li key={key}>
                        <Icon type="check" />
                        {' ' +
                          (item[key] instanceof Object ? item[key].title : item[key])}
                      </li>
                    );
                  })}
                </ul>
              </dd>
            </dl>
          ))}
      </div>
    );
  }
}
