/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { UPDATES_INPUT_FILTER_KEY, selectUpdatesFilter, selectVisibleLibUpdates } from '../selectors';

import { INPUT_FILTER_DELAY } from '../../../config';
import { LibraryStorage } from '../storage';
import LibraryStoragesList from '../components/storages-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';
import { revealFile } from '../../core/actions';


class LibraryUpdatesPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.instanceOf(LibraryStorage).isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadLibUpdates: PropTypes.func.isRequired,
    revealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    updateLibrary: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadLibUpdates();
  }

  render() {
    return (
      <div className='page-container'>
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
    searchLibrary: (query, page) => goTo(ownProps.history, '/libraries/registry/search', { query, page }),
    showLibrary: idOrManifest => goTo(ownProps.history, '/libraries/installed/show', { idOrManifest })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    revealFile,
    setFilter: value => dispatch(lazyUpdateInputValue(UPDATES_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LibraryUpdatesPage);
