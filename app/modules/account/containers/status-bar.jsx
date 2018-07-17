/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { selectAccountInfo, selectUpgradeInfo } from '../selectors';

import AccountStatusBarDropdown from '../components/sb-dropdown';
import AccountStatusBarUpgrade from '../components/sb-upgrade';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { osOpenUrl } from '../../core/actions';


class AccountStatusBar extends React.Component {

  static propTypes = {
    router: PropTypes.object.isRequired,
    data: PropTypes.shape({
      username: PropTypes.string,
      upgradePlan: PropTypes.string
    }),
    upgradeInfo: PropTypes.object,
    loadAccountInfo: PropTypes.func.isRequired,
    logoutAccount: PropTypes.func.isRequired,
    showInformationPage: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.props.loadAccountInfo();
  }

  render() {
    if (!this.props.data) {
      return <Spin size='small' />;
    }
    return (
      <table cellPadding='0' cellSpacing='0' width='100%'>
        <tbody>
          <tr>
            { this.props.upgradeInfo &&
              <td><AccountStatusBarUpgrade upgradeInfo={ this.props.upgradeInfo } osOpenUrl={ this.props.osOpenUrl } /></td>
            }
            <td className='text-right text-nowrap'><AccountStatusBarDropdown { ...this.props } /></td>
          </tr>
        </tbody>
      </table>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    data: selectAccountInfo(state),
    upgradeInfo: selectUpgradeInfo(state),
    showInformationPage: () => goTo(ownProps.router.history, '/account'),
    showLoginPage: () => goTo(ownProps.router.history, '/account/login')
  };
}

export default connect(mapStateToProps, {
  ...actions,
  osOpenUrl
})(AccountStatusBar);
