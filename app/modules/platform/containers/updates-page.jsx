/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { UPDATES_INPUT_FILTER_KEY, selectUpdatesFilter, selectVisiblePlatformUpdates } from '../selectors';
import { openUrl, revealFile } from '../../core/actions';

import PlatformsList from '../components/platforms-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';


class PlatformUpdatesPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadPlatformUpdates: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    updatePlatform: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired,
    revealFile: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadPlatformUpdates();
  }

  render() {
    return (
      <div className='page-container'>
        <PlatformsList { ...this.props } actions={ ['reveal', 'update'] } />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisiblePlatformUpdates(state),
    filterValue: selectUpdatesFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platforms/installed/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platforms/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    openUrl,
    revealFile,
    setFilter: value => dispatch(lazyUpdateInputValue(UPDATES_INPUT_FILTER_KEY, value))
  }), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformUpdatesPage);
