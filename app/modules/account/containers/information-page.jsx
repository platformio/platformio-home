/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import AccountInformation from '../components/information';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { osOpenUrl } from '../../core/actions';
import { selectAccountInfo } from '../selectors';


class AccountInformationPage extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      username: PropTypes.string,
      groups: PropTypes.array,
      subscriptions: PropTypes.array,
      currentPlan: PropTypes.string,
      upgradePlan: PropTypes.string
    }),
    loadAccountInfo: PropTypes.func.isRequired,
    logoutAccount: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.props.loadAccountInfo(true);
  }

  render() {
    if (this.props.data && !this.props.data.groups) {
      this.props.showLoginPage();
      return null;
    }
    return (
      <div className='page-container information-page'>
        { !this.props.data || !this.props.data.groups ? (
          <div className='text-center' style={{ paddingTop: '15px' }}>
            <Spin tip='Loading...' size='large' />
          </div>
          ) : (
          <AccountInformation { ...this.props } />
          ) }
      </div>
      );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    data: selectAccountInfo(state),
    showLoginPage: () => goTo(ownProps.history, '/account/login', null, true)
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl })(AccountInformationPage);
