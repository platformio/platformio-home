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
  UPDATES_INPUT_FILTER_KEY,
  selectUpdatesFilter,
  selectVisibleLibUpdates
} from '../selectors';

import { LibraryStorage } from '../storage';
import LibraryStoragesList from '../components/storages-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';
import { osRevealFile } from '../../core/actions';

class LibraryUpdatesPage extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.instanceOf(LibraryStorage).isRequired),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadLibUpdates: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    updateLibrary: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.props.loadLibUpdates();
  }

  render() {
    return (
      <div className="page-container">
        <LibraryStoragesList {...this.props} />
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisibleLibUpdates(state),
    filterValue: selectUpdatesFilter(state),
    searchLibrary: (query, page) =>
      goTo(ownProps.history, '/libraries/registry/search', { query, page }),
    showLibrary: idOrManifest =>
      goTo(ownProps.history, '/libraries/installed/show', { idOrManifest })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, actions, {
      osRevealFile,
      setFilter: value =>
        dispatch(lazyUpdateInputValue(UPDATES_INPUT_FILTER_KEY, value))
    }),
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(LibraryUpdatesPage);
