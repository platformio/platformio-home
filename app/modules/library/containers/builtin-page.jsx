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

import {
  BUILTIN_INPUT_FILTER_KEY,
  selectBuiltinFilter,
  selectVisibletBuiltinLibs,
} from '../selectors';

import { Alert } from 'antd';
import LibraryStoragesList from '../components/storages-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';
import { osRevealFile } from '../../core/actions';

class LibraryBuiltinPage extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        items: PropTypes.array.isRequired,
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
      }).isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadBuiltinLibs: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    showInstalledPlatforms: PropTypes.func.isRequired,
  };

  constructor() {
    super(...arguments);
    this.props.loadBuiltinLibs();
  }

  render() {
    return (
      <div className="page-container">
        <Alert
          className="block"
          showIcon
          message={
            <span>
              A list of built-in libraries in the installed{' '}
              <a onClick={() => this.props.showInstalledPlatforms()}>
                frameworks and development platforms
              </a>
              .
            </span>
          }
        />
        <LibraryStoragesList {...this.props} />
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisibletBuiltinLibs(state),
    filterValue: selectBuiltinFilter(state),
    searchLibrary: (query, page) =>
      goTo(ownProps.history, '/libraries/registry/search', { query, page }),
    showLibrary: (idOrManifest) =>
      goTo(ownProps.history, '/libraries/builtin/show', { idOrManifest }),
    showInstalledPlatforms: () => goTo(ownProps.history, '/platforms/installed'),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, actions, {
      osRevealFile,
      setFilter: (value) =>
        dispatch(lazyUpdateInputValue(BUILTIN_INPUT_FILTER_KEY, value)),
    }),
    dispatch
  );
}
export default connect(mapStateToProps, mapDispatchToProps)(LibraryBuiltinPage);
