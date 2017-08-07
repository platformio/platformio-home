/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

 import * as actions from '../actions';

import AccountForgotForm from '../components/forgot-form';
import { Form } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { openUrl } from '../../core/actions';


class AccountForgotPage extends React.Component {

  static propTypes = {
    forgotAccountPassword: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired,
    showRegistrationPage: PropTypes.func.isRequired
  }

  render() {
    const WrappedForm = Form.create()(AccountForgotForm);
    return (
      <div className='page-container forgot-page text-center'>
        <WrappedForm {...this.props} />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    showLoginPage: () => goTo(ownProps.history, '/account/login'),
    showRegistrationPage: () => goTo(ownProps.history, '/account/registration')
  };
}

export default connect(mapStateToProps, { ...actions, openUrl })(AccountForgotPage);
