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

import AccountRegistrationForm from '../components/registration-form';
import { Form } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { osOpenUrl } from '../../core/actions';

class AccountRegistrationPage extends React.Component {
  static propTypes = {
    registerAccount: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired
  };

  render() {
    const WrappedForm = Form.create()(AccountRegistrationForm);
    return (
      <div className="page-container registration-page text-center">
        <WrappedForm {...this.props} />
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    showLoginPage: () => goTo(ownProps.history, '/account/login')
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl })(
  AccountRegistrationPage
);
