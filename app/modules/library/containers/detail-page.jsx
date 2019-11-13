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

import LibraryDetailMain from '../components/detail-main';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { selectLibraryData } from '../selectors';

class LibraryDetailPage extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    data: PropTypes.object,
    idOrManifest: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    osOpenUrl: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    loadLibraryData: PropTypes.func.isRequired,
    installLibrary: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showInstalledLibraries: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.props.loadLibraryData(this.props.idOrManifest);
  }

  render() {
    return (
      <div className="page-container libraries-detail">
        {this.props.data ? (
          <LibraryDetailMain {...this.props} />
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
  const idOrManifest = ownProps.location.state.idOrManifest;
  return {
    data: selectLibraryData(state, idOrManifest),
    idOrManifest,
    searchLibrary: (query, page) =>
      goTo(ownProps.history, '/libraries/registry/search', { query, page }),
    showInstalledLibraries: () => goTo(ownProps.history, '/libraries/installed')
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl, osRevealFile })(
  LibraryDetailPage
);
