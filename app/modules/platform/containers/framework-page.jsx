/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import FrameworkDetailMain from '../components/framework-main';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { osOpenUrl } from '../../core/actions';
import { selectFrameworkData } from '../selectors';


class FrameworkDetailPage extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.object,
    loadFrameworkData: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.props.loadFrameworkData(this.props.name);
  }

  render() {
    return (
      <div className='page-container pf-detail'>
        <FrameworkDetailMain { ...this.props } />
      </div>
      );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  const name = ownProps.location.state.name;
  return {
    name,
    data: selectFrameworkData(state, name),
    showPlatform: name => goTo(ownProps.history, '/platforms/embedded/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platforms/frameworks/show', { name })
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl })(FrameworkDetailPage);
