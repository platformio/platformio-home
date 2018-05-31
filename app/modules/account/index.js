/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from './actions';

import MultiPage from '../core/components/multipage';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import routes from './routes';
import { selectIsUserLogged } from './selectors';


class AccountIndex extends React.Component {

  static propTypes = {
    userLogged: PropTypes.bool,
    loadAccountInfo: PropTypes.func.isRequired
  }

  UNSAFE_componentWillMount() {
    this.props.loadAccountInfo();
  }

  render() {
    return (
      <section className='account-module'>
        <MultiPage routes={ routes } disableMenu={ !this.props.userLogged  } />
      </section>
    );
  }
}

// Redux

function mapStateToProps(state) {
  return {
    userLogged: selectIsUserLogged(state)
  };
}

export default connect(mapStateToProps, actions)(AccountIndex);
