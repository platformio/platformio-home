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
    osFsGlob: PropTypes.func.isRequired,
  };

  static getGlobPatterns() {
    const patterns = [];
    ['*', path.join('*', '*'), path.join('*', '*', '*')].forEach((wildcard) => {
      patterns.push(path.join('examples', wildcard, 'platformio.ini'));
      patterns.push(path.join('examples', wildcard, 'src', '*.c'));
      patterns.push(path.join('examples', wildcard, 'src', '*.cpp'));
      patterns.push(path.join('examples', wildcard, 'src', '*.h'));
      patterns.push(path.join('examples', wildcard, 'src', '*.hpp'));
      patterns.push(path.join('examples', wildcard, 'src', '*.ino'));
    });
    return patterns;
  }

  constructor() {
    super(...arguments);
    if (!this.props.uris) {
      this.props.osFsGlob(PlatformProjectExamples.getGlobPatterns(), this.props.pkgDir);
    }
  }

  getItems() {
    if (!this.props.uris.length) {
      return [];
    }

    return this.props.uris
      .filter((uri) => uri.endsWith('platformio.ini'))
      .sort()
      .map((configUri) => {
        const projectDir = path.dirname(configUri);
        const projectDirTokens = path.split(projectDir);
        let projectName = path.basename(projectDir);
        const examplesIndex = projectDirTokens.lastIndexOf('examples');
        if (examplesIndex !== -1) {
          projectName = projectDirTokens.slice(examplesIndex + 1).join('/');
        }
        const pei = new ProjectExampleItem(projectName, projectDir);
        this.props.uris.forEach((uri) => {
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
        <div className="text-center">
          <Spin tip="Loading..." size="large" />
        </div>
      );
    }
    return <ProjectExamples items={this.getItems()} />;
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    uris: selectOsFSGlob(
      state,
      PlatformProjectExamples.getGlobPatterns(),
      ownProps.pkgDir
    ),
  };
}

export default connect(mapStateToProps, { osFsGlob })(PlatformProjectExamples);
