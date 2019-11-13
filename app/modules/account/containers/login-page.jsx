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
  };

  render() {
    if (this.props.data && this.props.data.groups) {
      this.props.showInformationPage();
      return null;
    }
    const WrappedForm = Form.create()(AccountLoginForm);
    return (
      <div className="page-container login-page text-center">
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
