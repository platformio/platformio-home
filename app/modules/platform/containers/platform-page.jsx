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

import { osOpenUrl, osRevealFile } from '../../core/actions';

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
    osOpenUrl: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    loadPlatformData: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    installPlatform: PropTypes.func.isRequired,
  };

  constructor() {
    super(...arguments);
    this.props.loadPlatformData(this.props.name);
  }

  render() {
    return (
      <div className="page-container pf-detail">
        {this.props.data ? (
          <PlatformDetailMain {...this.props} />
        ) : (
          <div className="text-center">
            <Spin tip="Loading..." size="large" />
          </div>
        )}
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
    showPlatform: (name) =>
      goTo(ownProps.history, '/platforms/embedded/show', { name }),
    showFramework: (name) =>
      goTo(ownProps.history, '/platforms/frameworks/show', { name }),
    showInstalledPlatforms: () => goTo(ownProps.history, '/platforms/installed'),
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl, osRevealFile })(
  PlatformDetailPage
);
