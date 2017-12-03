/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { DESKTOP_INPUT_FILTER_KEY, selectDesktopFilter, selectVisibleDesktopPlatforms } from '../selectors';
import { osOpenUrl, osRevealFile } from '../../core/actions';

import { Alert } from 'antd';
import PlatformsList from '../components/platforms-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';


class PlatformDesktopPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadRegistryPlatforms: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadRegistryPlatforms();
  }

  render() {
    return (
      <div className='page-container'>
        <Alert className='block' showIcon message={
          <div >
            Native development platform depends on a system <kbd>gcc</kbd>. Please install it before and check <kbd>gcc --version</kbd> command.
          </div>
        } />
        <PlatformsList { ...this.props } />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisibleDesktopPlatforms(state),
    filterValue: selectDesktopFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platforms/desktop/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platforms/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    osOpenUrl,
    osRevealFile,
    setFilter: value => dispatch(lazyUpdateInputValue(DESKTOP_INPUT_FILTER_KEY, value))
  }), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformDesktopPage);
