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
import { osFsGlob } from '../../core/actions';
import { selectOsFSGlob } from '../../core/selectors';


class PlatformProjectExamples extends React.Component {

  static propTypes = {
    pkgDir: PropTypes.string.isRequired,
    uris: PropTypes.arrayOf(PropTypes.string),
    osFsGlob: PropTypes.func.isRequired
  }

  static getGlobPatterns() {
    return [
      path.join('examples', '*', 'platformio.ini'),
      path.join('examples', '*', 'src', '*.c'),
      path.join('examples', '*', 'src', '*.cpp'),
      path.join('examples', '*', 'src', '*.h'),
      path.join('examples', '*', 'src', '*.hpp'),
      path.join('examples', '*', 'src', '*.ino'),
    ];
  }

  UNSAFE_componentWillMount() {
    if (!this.props.uris) {
      this.props.osFsGlob(PlatformProjectExamples.getGlobPatterns(), this.props.pkgDir);
    }
  }

  getItems() {
    if (!this.props.uris.length) {
      return [];
    }

    return this.props.uris
      .filter(uri => uri.endsWith('platformio.ini'))
      .sort()
      .map(configUri => {
        const projectDir = path.dirname(configUri);
        const pei = new ProjectExampleItem(path.basename(projectDir), projectDir);
        this.props.uris.forEach(uri => {
          if (uri.startsWith(projectDir)) {
            pei.addSource(uri, uri.substr(projectDir.length + 1));
          }
        });
        return pei;
    });
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
    uris: selectOsFSGlob(state, PlatformProjectExamples.getGlobPatterns(), ownProps.pkgDir)
  };
}

export default connect(mapStateToProps, { osFsGlob })(PlatformProjectExamples);
