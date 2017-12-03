/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { selectAccountToken, selectIsUserLogged } from '../selectors';

import AccountTokenForm from '../components/token-form';
import { Form } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { osOpenUrl } from '../../core/actions';


class AccountTokenPage extends React.Component {

  static propTypes = {
    userLogged: PropTypes.bool,
    token: PropTypes.string,
    showAccountToken: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  render() {
    if (!this.props.userLogged) {
      this.props.showLoginPage();
      return null;
    }
    const WrappedForm = Form.create()(AccountTokenForm);
    return (
      <div className='page-container token-page'>
        <WrappedForm {...this.props} />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    userLogged: selectIsUserLogged(state),
    token: selectAccountToken(state),
    showLoginPage: () => goTo(ownProps.history, '/account/login', null, true)
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl })(AccountTokenPage);
