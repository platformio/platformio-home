/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { Col, Row, Spin } from 'antd';

import AccountStatusBarDropdown from '../components/sb-dropdown';
import AccountStatusBarUpgrade from '../components/sb-upgrade';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { openUrl } from '../../core/actions';
import { selectAccountInfo } from '../selectors';


class AccountStatusBar extends React.Component {

  static propTypes = {
    router: PropTypes.object.isRequired,
    data: PropTypes.shape({
      username: PropTypes.string,
      upgradePlan: PropTypes.string
    }),
    loadAccountInfo: PropTypes.func.isRequired,
    logoutAccount: PropTypes.func.isRequired,
    showInformationPage: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadAccountInfo();
  }

  render() {
    if (!this.props.data) {
      return <Spin size='small' />;
    }
    return (
      <Row>
        <Col span={ 16 } className='text-center'><AccountStatusBarUpgrade upgradePlan={ this.props.data && this.props.data.upgradePlan } openUrl={ this.props.openUrl } /></Col>
        <Col span={ 8 } className='text-right'><AccountStatusBarDropdown { ...this.props } /></Col>
      </Row>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    data: selectAccountInfo(state),
    showInformationPage: () => goTo(ownProps.router.history, '/account'),
    showLoginPage: () => goTo(ownProps.router.history, '/account/login')
  };
}

export default connect(mapStateToProps, {
  ...actions,
  openUrl
})(AccountStatusBar);
