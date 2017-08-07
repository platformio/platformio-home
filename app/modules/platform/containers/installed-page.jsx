/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { INSTALLED_INPUT_FILTER_KEY, selectInstalledFilter, selectVisibleInstalledPlatforms } from '../selectors';
import { openUrl, revealFile } from '../../core/actions';

import { Alert } from 'antd';
import { INPUT_FILTER_DELAY } from '../../../config';
import PlatformsList from '../components/platforms-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';


class PlatformInstalledPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadInstalledPlatforms: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    uninstallPlatform: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired,
    revealFile: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadInstalledPlatforms();
  }

  render() {
    return (
      <div className='page-container'>
        <Alert className='block' showIcon message={
          <div>
            Project can depend on a specific version of development platform using <kbd>platform = name@x.y.z</kbd> in <b>platformio.ini</b>. <a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/projectconf/section_env_general.html#platform') }>More details...</a>
          </div>
         } />
        <PlatformsList { ...this.props } actions={ ['reveal', 'uninstall'] } />
      </div>
      );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisibleInstalledPlatforms(state),
    filterValue: selectInstalledFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platforms/installed/show', {
      name
    }),
    showFramework: name => goTo(ownProps.history, '/platforms/frameworks/show', {
      name
    })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    openUrl,
    revealFile,
    setFilter: value => dispatch(lazyUpdateInputValue(INSTALLED_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformInstalledPage);
