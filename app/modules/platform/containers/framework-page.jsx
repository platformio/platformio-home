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
  };

  constructor() {
    super(...arguments);
    this.props.loadFrameworkData(this.props.name);
  }

  render() {
    return (
      <div className="page-container pf-detail">
        <FrameworkDetailMain {...this.props} />
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
    showFramework: name =>
      goTo(ownProps.history, '/platforms/frameworks/show', { name })
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl })(FrameworkDetailPage);
