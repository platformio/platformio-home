/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Alert, Button, Icon, Tooltip } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import humanize from 'humanize';


export default class AccountInformation extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      username: PropTypes.string.isRequired,
      groups: PropTypes.array,
      currentPlan: PropTypes.string,
      upgradePlan: PropTypes.string
    }).isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  render() {
    return (
      <div>
        <div>
          <h1>General</h1>
          <dl className='dl-horizontal'>
            <dt>Logged in as</dt>
            <dd>
              { this.props.data.username }
            </dd>
            <dt>PIO Plus Plan</dt>
            <dd>
              <a onClick={ () => this.props.osOpenUrl('https://platformio.org/pricing?utm_campaign=account-info') } className='inline-block'>
                { this.props.data.currentPlan }
              </a>
              { this.props.data.upgradePlan &&
                <Button type='primary' icon='star' className='block' onClick={ () => this.props.osOpenUrl('https://platformio.org/pricing?utm_campaign=account-info') }>UPGRADE</Button> }
              { this.props.data.upgradePlan && <Alert showIcon message='Please do not forget to re-login after account upgrade to apply the new permissions.' /> }
            </dd>
          </dl>
        </div>
        <div>
          <h1>Groups</h1>
          { this.props.data.groups && this.props.data.groups.map(group => (
              <dl key={ group.name } className='dl-horizontal'>
                <dt>Name</dt>
                <dd>
                  { group.name }
                </dd>
                <dt>Expires</dt>
                <dd>
                  <Tooltip title={ group.expire ? new Date(group.expire * 1000).toString() : '' }>{ group.expire ? humanize.relativeTime(group.expire) : 'never' }</Tooltip>
                </dd>
                <dt>Permissions</dt>
                <dd>
                  <ul>
                    { group.permissions.map(permissionName => (
                        <li key={ permissionName }>
                          <Icon type='check' /> { permissionName }
                        </li>)
                      ) }
                  </ul>
                </dd>
              </dl>)
            ) }
        </div>
      </div>);
  }

}
