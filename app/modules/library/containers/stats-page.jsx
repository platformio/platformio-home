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

import LibrarySearchForm from '../components/search-form';
import LibraryStats from '../components/stats';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { osOpenUrl } from '../../core/actions';
import { selectStats } from '../selectors';

class LibraryStatsPage extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    loadStats: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.props.loadStats();
  }

  componentDidUpdate(prevProps) {
    // check if a store cache is reset
    if (prevProps.data && !this.props.data) {
      this.props.loadStats();
    }
  }

  render() {
    return (
      <div className="page-container libraries-stats">
        <LibrarySearchForm searchLibrary={this.props.searchLibrary} />
        {this.props.data ? (
          <LibraryStats {...this.props} />
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
  return {
    data: selectStats(state),
    searchLibrary: (query, page) =>
      goTo(ownProps.history, '/libraries/registry/search', { query, page }),
    showLibrary: idOrManifest =>
      goTo(ownProps.history, '/libraries/registry/show', { idOrManifest })
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl })(LibraryStatsPage);
