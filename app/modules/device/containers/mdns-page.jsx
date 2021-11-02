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

import * as actions from '../actions';

import { Button, Icon, Spin, Table, Tooltip, message } from 'antd';

import ClipboardJS from 'clipboard';
import PropTypes from 'prop-types';
import React from 'react';
import { cmpSort } from '../../core/helpers';
import { connect } from 'react-redux';
import { osOpenUrl } from '../../core/actions';
import { selectMDNSDevices } from '../selectors';

class DeviceMDNSPage extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object.isRequired),
    loadMDNSDevices: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired,
  };

  constructor() {
    super(...arguments);
    this.props.loadMDNSDevices();
  }

  componentDidMount() {
    this._clipboard = new ClipboardJS('.copy-name');
    this._clipboard.on('success', () =>
      message.success('A name has been copied to clipboard!')
    );
  }

  componentWillUnmount() {
    if (this._clipboard) {
      this._clipboard.destroy();
    }
  }

  ip2int(ip) {
    return (
      ip.split('.').reduce((ipInt, octet) => (ipInt << 8) + parseInt(octet, 10), 0) >>>
      0
    );
  }

  getTableColumns() {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        className: 'text-nowrap',
        sorter: (a, b) => cmpSort(a.name.toUpperCase(), b.name.toUpperCase()),
        render: (text, record) => (
          <span>
            {record.name}{' '}
            <Tooltip title="Click for copy a name to clipboard">
              <a className="copy-name" data-clipboard-text={record.name}>
                <Icon type="copy" />
              </a>
            </Tooltip>
          </span>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        className: 'text-word-break',
        sorter: (a, b) => cmpSort(a.type.toUpperCase(), b.type.toUpperCase()),
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        sorter: (a, b) => this.ip2int(a.ip) > this.ip2int(b.ip),
      },
      {
        title: 'Port',
        dataIndex: 'port',
        sorter: (a, b) => a.port > b.port,
      },
    ];
  }

  render() {
    return (
      <div className="page-container">
        <div className="block text-right">
          <Button
            ghost
            type="primary"
            icon="reload"
            disabled={!this.props.items}
            loading={!this.props.items}
            onClick={() => this.props.loadMDNSDevices(true)}
          >
            Refresh
          </Button>
        </div>
        {this.renderList()}
      </div>
    );
  }

  renderList() {
    if (!this.props.items) {
      return (
        <div className="text-center">
          <Spin tip="Loading..." size="large" />
        </div>
      );
    }
    if (this.props.items.length === 0) {
      return (
        <div>
          <ul className="background-message text-center">
            <li>No Items</li>
          </ul>
          <div className="text-center">
            <br />
            If you have Network Firewall, please enable incoming connections for
            PlatformIO Core (mDNS discovery service)
          </div>
        </div>
      );
    }
    return (
      <Table
        rowKey="name"
        dataSource={this.props.items}
        columns={this.getTableColumns()}
        size="middle"
        pagination={{
          defaultPageSize: 15,
          hideOnSinglePage: true,
        }}
      />
    );
  }
}

// Redux

function mapStateToProps(state) {
  return {
    items: selectMDNSDevices(state),
  };
}

export default connect(mapStateToProps, {
  ...actions,
  osOpenUrl,
})(DeviceMDNSPage);
