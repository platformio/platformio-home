/**
 * Copyright (c) 2014-present PlatformIO <contact@platformio.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
  };

  render() {
    if (!this.props.userLogged) {
      this.props.showLoginPage();
      return null;
    }
    const WrappedForm = Form.create()(AccountPasswordForm);
    return (
      <div className="page-container password-page">
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
