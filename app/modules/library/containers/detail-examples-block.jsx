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

class LibraryDetailExamplesBlock extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      examples: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
      __pkg_dir: PropTypes.string,
    }).isRequired,
    uris: PropTypes.arrayOf(PropTypes.string),
    osFsGlob: PropTypes.func.isRequired,
  };

  static getGlobPatterns(examples) {
    const result = [];
    if (examples) {
      if (typeof examples === 'string') {
        return [examples];
      } else if (typeof examples[0] === 'string') {
        return examples;
      } else if (examples[0].base && examples[0].files) {
        examples.forEach((example) => {
          example.files.forEach((filename) => {
            result.push(path.join(example.base, filename));
          });
        });
        return result;
      }
    }
    for (const ext of ['*.ino', '*.pde', '*.c', '*.cpp', '*.h', '*.hpp']) {
      const exmDir = '[Ee]xamples';
      result.push(path.join(exmDir, ext));
      result.push(path.join(exmDir, '*', ext));
      result.push(path.join(exmDir, '*', '*', ext));
      result.push(path.join(exmDir, '*', '*', '*', ext));
    }
    return result;
  }

  constructor() {
    super(...arguments);
    if (!this.props.uris) {
      this.props.osFsGlob(
        LibraryDetailExamplesBlock.getGlobPatterns(this.props.data.examples),
        this.props.data.__pkg_dir
      );
    }
  }

  getRemoteItems() {
    return this.props.uris.sort().map((uri) => {
      let name = uri;
      if (name.endsWith('/')) {
        name = uri.substr(0, uri.length - 1);
      }
      name = name.substring(name.lastIndexOf('/') + 1);
      if (name.includes('.')) {
        name = name.substring(0, name.lastIndexOf('.'));
      }
      const pe = new ProjectExampleItem(name);
      pe.addSource(uri, name);
      return pe;
    });
  }

  getLocalItems() {
    const candidates = new Map();
    const prefix = path.commonprefix(this.props.uris);
    for (const uri of this.props.uris) {
      const name = path.dirname(uri.substr(prefix.length + 1));
      const item = candidates.has(name)
        ? candidates.get(name)
        : new ProjectExampleItem(name);
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
    return this.props.uris[0].startsWith('http')
      ? this.getRemoteItems()
      : this.getLocalItems();
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
  if (!ownProps.data.__pkg_dir) {
    return {
      uris: ownProps.data.examples,
    };
  }
  return {
    uris: selectOsFSGlob(
      state,
      LibraryDetailExamplesBlock.getGlobPatterns(ownProps.data.examples),
      ownProps.data.__pkg_dir
    ),
  };
}

export default connect(mapStateToProps, {
  osFsGlob,
})(LibraryDetailExamplesBlock);
