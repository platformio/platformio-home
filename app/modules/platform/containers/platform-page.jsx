/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { openUrl, revealFile } from '../../core/actions';

import PlatformDetailMain from '../components/platform-main';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { selectPlatformData } from '../selectors';


class PlatformDetailPage extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.object,
    openUrl: PropTypes.func.isRequired,
    revealFile: PropTypes.func.isRequired,
    loadPlatformData: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    installPlatform: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadPlatformData(this.props.name);
  }

  render() {
    return (
      <div className='page-container pf-detail'>
        { this.props.data ? (
          <PlatformDetailMain { ...this.props } />
          ) : (
          <div className='text-center'>
            <Spin tip='Loading...' size='large' />
          </div>
          ) }
      </div>
      );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  const name = ownProps.location.state.name;
  return {
    name,
    data: selectPlatformData(state, name),
    showPlatform: name => goTo(ownProps.history, '/platforms/embedded/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platforms/frameworks/show', { name }),
    showInstalledPlatforms: () => goTo(ownProps.history, '/platforms/installed')
  };
}

export default connect(mapStateToProps, { ...actions, openUrl, revealFile })(PlatformDetailPage);
