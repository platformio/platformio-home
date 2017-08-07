/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import AccountPasswordForm from '../components/password-form';
import { Form } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { selectIsUserLogged } from '../selectors';


class AccountPasswordPage extends React.Component {

  static propTypes = {
    userLogged: PropTypes.bool,
    changeAccountPassword: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired
  }

  render() {
    if (!this.props.userLogged) {
      this.props.showLoginPage();
      return null;
    }
    const WrappedForm = Form.create()(AccountPasswordForm);
    return (
      <div className='page-container password-page'>
        <WrappedForm {...this.props} />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    userLogged: selectIsUserLogged(state),
    showLoginPage: () => goTo(ownProps.history, '/account/login', null, true),
    showForgotPage: () => goTo(ownProps.history, '/account/forgot')
  };
}

export default connect(mapStateToProps, actions)(AccountPasswordPage);
