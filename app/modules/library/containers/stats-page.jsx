/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
  }

  UNSAFE_componentWillMount() {
    this.props.loadStats();
  }

  componentWillReceiveProps(nextProps) {
    // check if a store cache is reset
    if (this.props.data && !nextProps.data) {
      this.props.loadStats();
    }
  }

  render() {
    return (
      <div className='page-container libraries-stats'>
        <LibrarySearchForm searchLibrary={ this.props.searchLibrary } />
        { this.props.data ? (
          <LibraryStats { ...this.props } />
          ) : (
          <div className='text-center'>
            <Spin tip='Loading...' size='large' />
          </div> ) }
      </div>
      );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    data: selectStats(state),
    searchLibrary: (query, page) => goTo(ownProps.history, '/libraries/registry/search', { query, page }),
    showLibrary: idOrManifest => goTo(ownProps.history, '/libraries/registry/show', { idOrManifest })
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl })(LibraryStatsPage);
