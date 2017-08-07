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
import { openUrl } from '../../core/actions';


class AccountLoginPage extends React.Component {

  static propTypes = {
    loginAccount: PropTypes.func.isRequired,
    showInformationPage: PropTypes.func.isRequired,
    showRegistrationPage: PropTypes.func.isRequired,
    showForgotPage: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired
  }

  render() {
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
    showInformationPage: () => goTo(ownProps.history, '/account', null, true),
    showRegistrationPage: () => goTo(ownProps.history, '/account/registration'),
    showForgotPage: () => goTo(ownProps.history, '/account/forgot')
  };
}

export default connect(mapStateToProps, { ...actions, openUrl })(AccountLoginPage);
