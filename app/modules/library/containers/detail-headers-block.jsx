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

import LibraryDetailHeaders from '../components/detail-headers';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { osFsGlob } from '../../core/actions';
import { selectOsFSGlob } from '../../core/selectors';

class LibraryDetailHeadersBlock extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      headers: PropTypes.arrayOf(PropTypes.string),
      __pkg_dir: PropTypes.string,
    }).isRequired,
    uris: PropTypes.arrayOf(PropTypes.string),
    osFsGlob: PropTypes.func.isRequired,
  };

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

  constructor() {
    super(...arguments);
    if (this.props.data.__pkg_dir && !this.props.uris) {
      this.props.osFsGlob(
        LibraryDetailHeadersBlock.getGlobPatterns(),
        this.props.data.__pkg_dir
      );
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
      return <LibraryDetailHeaders items={this.props.data.headers} />;
    }
    if (!this.props.uris) {
      return (
        <div className="text-center">
          <Spin tip="Loading..." size="large" />
        </div>
      );
    }
    return <LibraryDetailHeaders items={this.getUniqueFilenames(this.props.uris)} />;
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    uris: ownProps.data.__pkg_dir
      ? selectOsFSGlob(
          state,
          LibraryDetailHeadersBlock.getGlobPatterns(),
          ownProps.data.__pkg_dir
        )
      : undefined,
  };
}

export default connect(mapStateToProps, { osFsGlob })(LibraryDetailHeadersBlock);
