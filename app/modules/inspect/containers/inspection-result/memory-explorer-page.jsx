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

import { MemoryDirExplorer } from '@inspect/components/memory-dir-explorer';
import { MemorySymbolsExplorer } from '@inspect/components/memory-symbols-explorer.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { selectExplorerSizeData } from '@inspect/selectors';

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
          files: new Set()
        });
      }

      const { files, dirs } = this.children.get(parentPath);
      const childPath = pathlib.join(...parts.slice(0, i + 1));
      const childIsDir = i + 1 !== parts.length || isDir;

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
    while (
      (next = this.children.get(current)) &&
      next.dirs.size == 1 &&
      next.files.size == 0
    ) {
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
    Object.entries(valuesMap).forEach(([k, v]) => (aggr[k] += v));
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
    files: PropTypes.arrayOf(
      PropTypes.shape({
        flash: PropTypes.number.isRequired,
        isDir: PropTypes.bool.isRequired,
        path: PropTypes.string.isRequired,
        ram: PropTypes.number.isRequired
      })
    )
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  listDir(cwd) {
    const { files: allFiles } = this.props;
    if (allFiles === undefined) {
      return undefined;
    }

    const uniqueFilter = new UniqueFilter();
    const aggregator = new AggregatorMap();
    const dirUnfolder = new DirectoryUnfolder();

    const result = (this.props.files || [])
      .filter(item => !cwd || item.path.startsWith(cwd))
      .map(({ path, isDir, ram, flash }) => {
        const root = cwd || path.substring(0, path.indexOf(pathlib.sep) + 1);
        const relativePath = path.substring(root.length);
        const relativePathParts = pathlib.split(relativePath);
        const name = relativePathParts[0];

        // FIXME: seems like there can be problems if cwd=undefined
        // Relative path in this case has stripped drive,
        // if drives have same relative path then overlapping occures
        // const fullRelativePath
        const displayName = !cwd && root ? pathlib.join(root, name) : name;
        dirUnfolder.remember(relativePathParts, isDir);
        aggregator.increment(displayName, { flash, ram });

        return {
          isDir: relativePathParts.length !== 1 || isDir,
          flash,
          ram,
          relativePath: displayName
          // relativePath: name # missed device when listing root!
          // relativePath: pathlib.join(root, name) // abs path to dir, not relative!
        };
      })
      .filter(({ relativePath }) => uniqueFilter.filter(relativePath))
      // Override with aggregated values
      .map(x => {
        aggregator.assign(x, x.relativePath);
        x.relativePath = dirUnfolder.unfold(x.relativePath);
        return x;
      });

    return result;
  }

  getFileByPath(path) {
    const { files } = this.props;
    if (path === undefined || !files) {
      return;
    }
    const item = files.filter(x => x.path === path)[0];
    return item && !item.isDir ? item : undefined;
  }

  handlePathChange = path => {
    this.setState({
      path
    });
  };

  render() {
    const { path } = this.state;
    const selectedFile = this.getFileByPath(path);
    const dirList = selectedFile ? [] : this.listDir(path);

    return (
      <div className="page-container">
        {!dirList && (
          <div className="text-center">
            <Spin tip="Loading..." size="large" />
          </div>
        )}
        {dirList && !selectedFile && (
          <MemoryDirExplorer
            dir={path}
            items={dirList}
            onDirChange={this.handlePathChange}
            onFileClick={this.handlePathChange}
          />
        )}
        {selectedFile && (
          <MemorySymbolsExplorer
            file={selectedFile.path}
            symbols={selectedFile.symbols}
            onDirChange={this.handlePathChange}
          />
        )}
      </div>
    );
  }
}

// Redux
function mapStateToProps(state) {
  return {
    files: selectExplorerSizeData(state)
  };
}

export default connect(mapStateToProps)(FileExplorerPage);
