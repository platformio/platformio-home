/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as path from '../../core/path';

import LibraryDetailHeaders from '../components/detail-headers';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { fsGlob } from '../../core/actions';
import { selectFSGlob } from '../../core/selectors';


class LibraryDetailHeadersBlock extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      headers: PropTypes.arrayOf(PropTypes.string),
      __pkg_dir: PropTypes.string
    }).isRequired,
    uris: PropTypes.arrayOf(PropTypes.string),
    fsGlob: PropTypes.func.isRequired
  }

  static getGlobPatterns() {
    const result = [];
    for (const ext of ['*.h', '*.hpp']) {
      result.push(ext);
      result.push(path.join('*', ext));
      result.push(path.join('*', '*', ext));
      result.push(path.join('*', '*', '*', ext));
    }
    return result;
  }

  componentWillMount() {
    if (this.props.data.__pkg_dir && !this.props.uris) {
      this.props.fsGlob(LibraryDetailHeadersBlock.getGlobPatterns(), this.props.data.__pkg_dir);
    }
  }

  getUniqueFilenames(uris) {
    if (!uris || !uris.length) {
      return [];
    }
    const result = [];
    const prefix = path.commonprefix(uris);
    for (const uri of uris) {
      const name = uri.substr(prefix.length + 1);
      if (!result.includes(name)) {
        result.push(name);
      }
    }
    return result;
  }

  render() {
    if (!this.props.data.__pkg_dir) {
      return <LibraryDetailHeaders items={ this.props.data.headers } />;
    }
    if (!this.props.uris) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>);
    }
    return <LibraryDetailHeaders items={ this.getUniqueFilenames(this.props.uris) } />;
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    uris: ownProps.data.__pkg_dir ? selectFSGlob(state, LibraryDetailHeadersBlock.getGlobPatterns(), ownProps.data.__pkg_dir) : undefined
  };
}

export default connect(mapStateToProps, { fsGlob })(LibraryDetailHeadersBlock);
