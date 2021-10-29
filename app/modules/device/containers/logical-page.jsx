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

import { Button, Icon, Spin, Table, Tooltip, message } from 'antd';
import { loadLogicalDevices, osOpenUrl } from '../../core/actions';

import ClipboardJS from 'clipboard';
import PropTypes from 'prop-types';
import React from 'react';
import { cmpSort } from '../../core/helpers';
import { connect } from 'react-redux';
import { selectLogicalDevices } from '../../core/selectors';

class DeviceLogicalPage extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object.isRequired),
    loadLogicalDevices: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired,
  };

  constructor() {
    super(...arguments);
    this.props.loadLogicalDevices();
  }

  componentDidMount() {
    this._clipboard = new ClipboardJS('.copy-path');
    this._clipboard.on('success', () =>
      message.success('Device path has been copied to clipboard!')
    );
  }

  componentWillUnmount() {
    if (this._clipboard) {
      this._clipboard.destroy();
    }
  }

  getTableColumns() {
    return [
      {
        title: 'Path',
        dataIndex: 'path',
        className: 'text-nowrap',
        sorter: (a, b) => cmpSort(a.path.toUpperCase(), b.path.toUpperCase()),
        render: (text, record) => (
          <span>
            {record.path}{' '}
            <Tooltip title="Click for copy a device path to clipboard">
              <a className="copy-path" data-clipboard-text={record.path}>
                <Icon type="copy" />
              </a>
            </Tooltip>
          </span>
        ),
      },
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: (a, b) => cmpSort(a.name.toUpperCase(), b.name.toUpperCase()),
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
            onClick={() => this.props.loadLogicalDevices(true)}
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
        <ul className="background-message text-center">
          <li>No Items</li>
        </ul>
      );
    }
    return (
      <Table
        rowKey="path"
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
    items: selectLogicalDevices(state),
  };
}

export default connect(mapStateToProps, {
  loadLogicalDevices,
  osOpenUrl,
})(DeviceLogicalPage);
