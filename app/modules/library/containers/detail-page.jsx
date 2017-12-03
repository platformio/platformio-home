/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
    idOrManifest: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object
    ]),
    osOpenUrl: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    loadLibraryData: PropTypes.func.isRequired,
    installLibrary: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showInstalledLibraries: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadLibraryData(this.props.idOrManifest);
  }

  render() {
    return (
      <div className='page-container libraries-detail'>
        { this.props.data ? (
          <LibraryDetailMain { ...this.props } />
          ) : (
          <div className='text-center'>
            <Spin tip='Loading...' size='large' />
          </div>
          ) }
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
    searchLibrary: (query, page) => goTo(ownProps.history, '/libraries/registry/search', { query, page }),
    showInstalledLibraries: () => goTo(ownProps.history, '/libraries/installed'),
  };
}

export default connect(mapStateToProps, { ...actions, osOpenUrl, osRevealFile })(LibraryDetailPage);
