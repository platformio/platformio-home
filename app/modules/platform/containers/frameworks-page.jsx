/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { FRAMEWORKS_INPUT_FILTER_KEY, selectFrameworksFilter, selectVisibleFrameworks } from '../selectors';

import FrameworksList from '../components/frameworks-list';
import { INPUT_FILTER_DELAY } from '../../../config';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';


class FrameworksPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
    loadRegistryFrameworks: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadRegistryFrameworks();
  }

  render() {
    return (
      <div className='page-container'>
        <FrameworksList { ...this.props } />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisibleFrameworks(state),
    filterValue: selectFrameworksFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platforms/embedded/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platforms/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    setFilter: value => dispatch(lazyUpdateInputValue(FRAMEWORKS_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FrameworksPage);
