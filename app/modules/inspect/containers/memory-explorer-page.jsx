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

import * as pathlib from '@core/path';

import { MemoryExplorer } from '../components/memory-explorer';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { requestContent } from '@core/actions';
import { selectSizeDataForPath } from '../selectors';

/**
 * Remember parent/children for all intermediate paths
 */
class DirectoryUnfolder {
  children = new Map();

  remember(parts, isDir) {
    let parentPath = '';
    for (let i = 0; i < parts.length; i++) {
      if (!this.children.has(parentPath)) {
        this.children.set(parentPath, {
          dirs: new Set(),
          files: new Set(),
        });
      }

      const { files, dirs } = this.children.get(parentPath);
      const childPath = pathlib.join(...parts.slice(0, i+1));
      const childIsDir = (i + 1 !== parts.length) || isDir;

      if (childIsDir) {
        dirs.add(childPath);
      } else {
        files.add(childPath);
      }
      parentPath = childPath;
    }
  }
  unfold(path) {
    // Concatenate child dirs with single subdir
    let current = path;
    let next;
    while ((next = this.children.get(current)) &&
        next.dirs.size == 1 &&
        next.files.size == 0) {
      current = next.dirs.values().next().value;
    }
    return current;
  }
}

class AggregatorMap {
  map = new Map();

  increment(key, valuesMap) {
    if (!this.map.has(key)) {
      this.map.set(key, valuesMap);
      return;
    }
    const aggr = this.map.get(key);
    Object.entries(valuesMap).forEach(([k, v]) => aggr[k] += v);
  }

  assign(obj, key) {
    return Object.assign(obj, this.map.get(key));
  }
}

class UniqueFilter {
  values = new Set();

  filter(value) {
    if (this.values.has(value)) {
      return false;
    }
    this.values.add(value);
    return true;
  }
}


class FileExplorerPage extends React.PureComponent {

  static propTypes = {
    requestContent: PropTypes.func.isRequired,
    files: PropTypes.arrayOf(PropTypes.shape({
      flash: PropTypes.int,
      isDir: PropTypes.bool,
      path: PropTypes.string.isRequired,
      ram: PropTypes.int,
    })),

  }

  constructor(...args) {
    super(...args);

    this.state = {
      cwd: pathlib.ROOT_DIR
    };

    this.props.requestContent({
      uri: 'http://dl.platformio.org/tmp/sizedata-tasmota.json'
    });
  }

  getItemsAtPath(cwd) {
    cwd = pathlib.ensureTrailingSlash(cwd);
    const {files: allFiles} = this.props;

    if (allFiles === undefined) {
      return undefined;
    }

    const uniqueFilter = new UniqueFilter();
    const aggregator = new AggregatorMap();
    const dirUnfolder = new DirectoryUnfolder();

    const result = allFiles
      // Left children
      .filter(x => x.path.startsWith(cwd))
      .map(({path, isDir, ram, flash}) => {
          // Convert path to relative
          const relativePath = path.substring(cwd.length);
          const relativePathParts = pathlib.split(relativePath);
          const name = relativePathParts[0];

          dirUnfolder.remember(relativePathParts, isDir);
          aggregator.increment(name, { flash, ram });

          return {
            isDir: relativePathParts.length !== 1 || isDir,
            flash,
            ram,
            relativePath: name,
          };
      })
      .filter(({relativePath})  => uniqueFilter.filter(relativePath))
      // Override with aggregated values
      .map(x => {
        aggregator.assign(x, x.relativePath);
        x.relativePath = dirUnfolder.unfold(x.relativePath);
        return x;
      });

    return result;
  }

  onDirChange = (cwd) => {
    this.setState({
      cwd
    });
  }

  render() {
    const { cwd } = this.state;
    const items = this.getItemsAtPath(cwd);

    return (
      <div className='page-container'>
        {items === undefined && (<div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>)}

        {items && (<MemoryExplorer
          dir={cwd}
          items={items}
          onDirChange={this.onDirChange} />)}
      </div>
      );
  }
}

// Redux
function mapStateToProps(state) {
  return {
    files: selectSizeDataForPath(state)
  };
}


export default connect(mapStateToProps, {requestContent})(FileExplorerPage);