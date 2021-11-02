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
      profile: PropTypes.shape({
        username: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        firstname: PropTypes.string,
        lastname: PropTypes.string,
      }).isRequired,
      packages: PropTypes.array,
      subscriptions: PropTypes.array,
    }).isRequired,
    loadAccountInfo: PropTypes.func.isRequired,
    logoutAccount: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired,
  };

  constructor() {
    super(...arguments);
    this.props.loadAccountInfo(true);
  }

  render() {
    if (this.props.data && !this.props.data.packages) {
      this.props.showLoginPage();
      return null;
    }
    return (
      <div className="page-container information-page">
        {!this.props.data || !this.props.data.packages ? (
          <div className="text-center" style={{ paddingTop: '15px' }}>
            <Spin tip="Loading..." size="large" />
          </div>
        ) : (
          <AccountInformation {...this.props} />
        )}
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    data: selectAccountInfo(state),
    showLoginPage: () => goTo(ownProps.history, '/account/login', null, true),
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl })(
  AccountInformationPage
);
