/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
  }

  render() {
    const WrappedForm = Form.create()(AccountRegistrationForm);
    return (
      <div className='page-container registration-page text-center'>
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

export default connect(mapStateToProps, { ...actions, osOpenUrl })(AccountRegistrationPage);
