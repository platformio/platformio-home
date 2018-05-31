/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { INSTALLED_INPUT_FILTER_KEY, selectInstalledFilter, selectVisibleInstalledLibs } from '../selectors';

import { Button } from 'antd';
import { LibraryStorage } from '../storage';
import LibraryStoragesList from '../components/storages-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';
import { osRevealFile } from '../../core/actions';


class LibraryInstalledPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.instanceOf(LibraryStorage).isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadInstalledLibs: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    uninstallLibrary: PropTypes.func.isRequired
  }

  UNSAFE_componentWillMount() {
    this.props.loadInstalledLibs();
  }

  render() {
    return (
      <div className='page-container'>
        <LibraryStoragesList {...this.props} />
        { this.props.items && this.props.items.length === 0 && (
          <div className='text-center'>
            <br />
            <Button icon='star' type='primary' onClick={ () => this.props.searchLibrary('') }>
              Show TOP libraries
            </Button>
          </div>
          ) }
      </div>
      );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisibleInstalledLibs(state),
    filterValue: selectInstalledFilter(state),
    searchLibrary: (query, page) => goTo(ownProps.history, '/libraries/registry/search', {
      query,
      page
    }),
    showLibrary: idOrManifest => goTo(ownProps.history, '/libraries/installed/show', {
      idOrManifest
    })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    osRevealFile,
    setFilter: value => dispatch(lazyUpdateInputValue(INSTALLED_INPUT_FILTER_KEY, value))
  }), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LibraryInstalledPage);
