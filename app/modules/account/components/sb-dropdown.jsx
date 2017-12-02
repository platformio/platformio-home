/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Dropdown, Icon, Menu } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';


export default class AccountStatusBarDropdown extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      username: PropTypes.string,
      upgradePlan: PropTypes.string
    }),
    logoutAccount: PropTypes.func.isRequired,
    showInformationPage: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  render() {
    if (!this.props.data || !this.props.data.username) {
      return <a onClick={ () => this.props.showLoginPage() }>Have an account? Log in</a>;
    }
    return (
      <Dropdown overlay={ this.renderUsermenu() } trigger={ ['click'] }>
        <a className='ant-dropdown-link' href='#'>
          <Icon type='user' />
          { ' ' + this.props.data.username.split('@')[0] }
          <Icon type='down' />
        </a>
      </Dropdown>
      );
  }

  renderUsermenu() {
    return (
      <Menu style={ { minWidth: '110px' } } selectedKeys={ ['upgrade'] }>
        <Menu.Item key='account'>
          <a onClick={ () => this.props.showInformationPage() }>
            <Icon type='user' /> Account</a>
        </Menu.Item>
        { this.props.data.upgradePlan &&
          <Menu.Item key='upgrade'>
            <a onClick={ () => this.props.osOpenUrl('http://platformio.org/pricing?utm_campaign=account-sb') }>
              <Icon type='star' /> Upgrade</a>
          </Menu.Item> }
        <Menu.Divider />
        <Menu.Item key='logout'>
          <a onClick={ () => this.props.logoutAccount() }>
            <Icon type='logout' /> Log out</a>
        </Menu.Item>
      </Menu>
      );
  }
}
