/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    loadLogicalDevices: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadLogicalDevices();
  }

  componentDidMount() {
    this._clipboard = new ClipboardJS('.copy-path');
    this._clipboard.on('success', () => message.success('Device path has been copied to clipboard!'));
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
          <span>{ record.path } <Tooltip title='Click for copy a device path to clipboard'><a className='copy-path' data-clipboard-text={ record.path }><Icon type='copy' /></a></Tooltip></span>
        )
      },
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: (a, b) => cmpSort(a.name.toUpperCase(), b.name.toUpperCase())
      }
    ];
  }

  render() {
    return (
      <div className='page-container'>
        <div className='block text-right'>
          <Button ghost
            type='primary'
            icon='reload'
            disabled={ !this.props.items }
            loading={ !this.props.items }
            onClick={ () => this.props.loadLogicalDevices(true) }>
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
      <Table rowKey='path'
        dataSource={ this.props.items }
        columns={ this.getTableColumns() }
        size='middle'
        pagination={ false } />
      );
  }

}

// Redux

function mapStateToProps(state) {
  return {
    items: selectLogicalDevices(state)
  };
}

export default connect(mapStateToProps, {
  loadLogicalDevices,
  osOpenUrl
})(DeviceLogicalPage);
