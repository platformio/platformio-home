/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import AccountLoginForm from '../components/login-form';
import { Form } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { osOpenUrl } from '../../core/actions';
import { selectAccountInfo } from '../selectors';


class AccountLoginPage extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      username: PropTypes.string,
      groups: PropTypes.array,
      currentPlan: PropTypes.string,
      upgradePlan: PropTypes.string
    }),
    loginAccount: PropTypes.func.isRequired,
    showInformationPage: PropTypes.func.isRequired,
    showRegistrationPage: PropTypes.func.isRequired,
    showForgotPage: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  render() {
    if (this.props.data && this.props.data.groups) {
      this.props.showInformationPage();
      return null;
    }
    const WrappedForm = Form.create()(AccountLoginForm);
    return (
      <div className='page-container login-page text-center'>
        <WrappedForm {...this.props} />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    data: selectAccountInfo(state),
    showInformationPage: () => goTo(ownProps.history, '/account', null, true),
    showRegistrationPage: () => goTo(ownProps.history, '/account/registration'),
    showForgotPage: () => goTo(ownProps.history, '/account/forgot')
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl })(AccountLoginPage);
