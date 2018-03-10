/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { Alert, Button, Icon, Spin, Table, Tooltip, message } from 'antd';

import ClipboardJS from 'clipboard';
import PropTypes from 'prop-types';
import React from 'react';
import { cmpSort } from '../../core/helpers';
import { connect } from 'react-redux';
import { osOpenUrl } from '../../core/actions';
import { selectSerialDevices } from '../selectors';


class DeviceSerialPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    loadSerialDevices: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadSerialDevices();
  }

  componentDidMount() {
    this._clipboard = new ClipboardJS('.copy-port');
    this._clipboard.on('success', () => message.success('Port name has been copied to clipboard!'));
  }

  componentWillUnmount() {
    if (this._clipboard) {
      this._clipboard.destroy();
    }
  }

  getTableColumns() {
    return [
      {
        title: 'Port',
        dataIndex: 'port',
        className: 'text-nowrap',
        sorter: (a, b) => cmpSort(a.port.toUpperCase(), b.port.toUpperCase()),
        render: (text, record) => (
          <span>{ record.port } <Tooltip title='Click for copy a port name to clipboard'><a className='copy-port' data-clipboard-text={ record.port }><Icon type='copy' /></a></Tooltip></span>
        )
      },
      {
        title: 'Description',
        dataIndex: 'description',
        className: 'text-word-break',
        sorter: (a, b) => cmpSort(a.description.toUpperCase(), b.description.toUpperCase())
      },
      {
        title: 'Hardware',
        dataIndex: 'hwid',
        className: 'text-nowrap',
        sorter: (a, b) => cmpSort(a.hwid.toUpperCase(), b.hwid.toUpperCase())
      }
    ];
  }

  render() {
    return (
      <div className='page-container'>
        <Alert className='block' showIcon message={ (
          <div>
            PlatformIO automatically detects upload port by default. You can configure a custom port using <code>upload_port</code> option in <b>platformio.ini</b>. <a onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/page/projectconf/section_env_upload.html#upload-port') }>More details...</a>
          </div>
         ) } />
        <div className='block text-right'>
          <Button ghost
            type='primary'
            icon='reload'
            disabled={ !this.props.items }
            loading={ !this.props.items }
            onClick={ () => this.props.loadSerialDevices(true) }>
            Refresh
          </Button>
        </div>
        { this.renderList() }
      </div>
      );
  }

  renderList() {
    if (!this.props.items) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }
    if (this.props.items.length === 0) {
      return (
        <ul className='background-message text-center'>
          <li>
            No Items
          </li>
        </ul>
        );
    }
    return (
      <Table rowKey='port'
        dataSource={ this.props.items }
        columns={ this.getTableColumns() }
        size='middle'
        pagination={{
          defaultPageSize: 15,
          hideOnSinglePage: true
        }} />
      );
  }

}

// Redux

function mapStateToProps(state) {
  return {
    items: selectSerialDevices(state)
  };
}

export default connect(mapStateToProps, {
  ...actions,
  osOpenUrl
})(DeviceSerialPage);
