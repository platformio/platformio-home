/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as path from '../../core/path';

import { ProjectExampleItem, ProjectExamples } from '../../project/containers/examples';

import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { fsGlob } from '../../core/actions';
import { selectFSGlob } from '../../core/selectors';


class LibraryDetailExamplesBlock extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      examples: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.string
      ]),
      __pkg_dir: PropTypes.string
    }).isRequired,
    uris: PropTypes.arrayOf(PropTypes.string),
    fsGlob: PropTypes.func.isRequired
  }

  static getGlobPatterns(custom) {
    if (custom) {
      return typeof custom === 'string' ? [custom] : custom;
    }
    const result = [];
    for (const ext of ['*.ino', '*.pde', '*.c', '*.cpp', '*.h', '*.hpp']) {
      const exmDir = '[Ee]xamples';
      result.push(path.join(exmDir, ext));
      result.push(path.join(exmDir, '*', ext));
      result.push(path.join(exmDir, '*', '*', ext));
      result.push(path.join(exmDir, '*', '*', '*', ext));
    }
    return result;
  }

  componentWillMount() {
    if (!this.props.uris) {
      this.props.fsGlob(
        LibraryDetailExamplesBlock.getGlobPatterns(this.props.data.examples),
        this.props.data.__pkg_dir
      );
    }
  }

  getRemoteItems() {
    return this.props.uris.sort().map(uri => {
      const pe = new ProjectExampleItem(uri.includes('.') ? path.basename(uri, path.extname(uri)) : path.basename(uri));
      pe.addSource(uri);
      return pe;
    });
  }

  getLocalItems() {
    const candidates = new Map();
    const prefix = path.commonprefix(this.props.uris);
    for (const uri of this.props.uris) {
      const name = path.dirname(uri.substr(prefix.length + 1));
      const item = candidates.has(name) ? candidates.get(name) : new ProjectExampleItem(name);
      item.addSource(uri);
      candidates.set(name, item);
    }
    const result = [];
    for (const entry of candidates.entries()) {
      result.push(entry[1]);
    }
    return result;
  }

  getItems() {
    if (!this.props.uris.length) {
      return [];
    }
    return this.props.uris[0].startsWith('http') ? this.getRemoteItems() : this.getLocalItems();
  }

  render() {
    if (!this.props.uris) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }
    return <ProjectExamples items={ this.getItems() } />;
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  if (!ownProps.data.__pkg_dir) {
    return {
      uris: ownProps.data.examples
    };
  }
  return {
    uris: selectFSGlob(
      state,
      LibraryDetailExamplesBlock.getGlobPatterns(ownProps.data.examples),
      ownProps.data.__pkg_dir
    )
  };
}

export default connect(mapStateToProps, {
  fsGlob
})(LibraryDetailExamplesBlock);
