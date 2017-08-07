/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { BUILTIN_INPUT_FILTER_KEY, selectBuiltinFilter, selectVisibletBuiltinLibs } from '../selectors';

import { Alert } from 'antd';
import { INPUT_FILTER_DELAY } from '../../../config';
import LibraryStoragesList from '../components/storages-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';
import { revealFile } from '../../core/actions';


class LibraryBuiltinPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        items: PropTypes.array.isRequired,
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired
      }).isRequired
    ),
    filterValue: PropTypes.string,
    loadBuiltinLibs: PropTypes.func.isRequired,
    revealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    showInstalledPlatforms: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadBuiltinLibs();
  }

  render() {
    return (
      <div className='page-container'>
        <Alert className='block' showIcon message={
          <span>
            A list of built-in libraries in the installed <a onClick={ () => this.props.showInstalledPlatforms() }>frameworks and development platforms</a>.
          </span>
        } />
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
    searchLibrary: (query, page) => goTo(ownProps.history, '/libraries/registry/search', { query, page }),
    showLibrary: idOrManifest => goTo(ownProps.history, '/libraries/builtin/show', { idOrManifest }),
    showInstalledPlatforms: () => goTo(ownProps.history, '/platforms/installed')
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    revealFile,
    setFilter: value => dispatch(lazyUpdateInputValue(BUILTIN_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(LibraryBuiltinPage);
