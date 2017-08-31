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


class PlatformProjectExamples extends React.Component {

  static propTypes = {
    pkgDir: PropTypes.string.isRequired,
    uris: PropTypes.arrayOf(PropTypes.string),
    fsGlob: PropTypes.func.isRequired
  }

  static getGlobPatterns() {
    return [
      path.join('examples', '*', '*.ini'),
      path.join('examples', '*', '*', '*.c'),
      path.join('examples', '*', '*', '*.cpp'),
      path.join('examples', '*', '*', '*.h'),
      path.join('examples', '*', '*', '*.hpp'),
      path.join('examples', '*', '*', '*.ino'),
    ];
  }

  componentWillMount() {
    if (!this.props.uris) {
      this.props.fsGlob(PlatformProjectExamples.getGlobPatterns(), this.props.pkgDir);
    }
  }

  getItems() {
    if (!this.props.uris.length) {
      return [];
    }
    const candidates = new Map();
    const prefix = path.commonprefix(this.props.uris);
    for (const uri of this.props.uris) {
      const exampleName = uri.substr(prefix.length + 1, uri.indexOf(path.sep, prefix.length + 1) - prefix.length - 1);
      const item = candidates.has(exampleName) ? candidates.get(exampleName) : new ProjectExampleItem(exampleName);
      item.addSource(uri, uri.substr(prefix.length + exampleName.length + 2));
      candidates.set(exampleName, item);
    }
    const result = [];
    for (const entry of candidates.entries()) {
      result.push(entry[1]);
    }
    return result;
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
  return {
    uris: selectFSGlob(state, PlatformProjectExamples.getGlobPatterns(), ownProps.pkgDir)
  };
}

export default connect(mapStateToProps, { fsGlob })(PlatformProjectExamples);
