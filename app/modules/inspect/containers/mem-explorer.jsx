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

import { MemoryDirExplorer } from '@inspect/components/mem-dir-explorer';
import { MemorySymbols } from '@app/modules/inspect/components/mem-symbols.jsx';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { openTextDocument } from '@core/actions';
import { selectExplorerSizeData } from '@inspect/selectors';

/**
 * Remember parent/children for all intermediate paths
 */
class DirectoryUnfolder {
  children = new Map();

  remember(path, isDir) {
    const parts = path.split('/');
    let parentPath = '';
    for (let i = 0; i < parts.length; i++) {
      if (!this.children.has(parentPath)) {
        this.children.set(parentPath, {
          dirs: new Set(),
          files: new Set()
        });
      }

      const { files, dirs } = this.children.get(parentPath);
      const childPath = parts.slice(0, i + 1).join('/');
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
    ),
    openTextDocument: PropTypes.func.isRequired
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
      .filter(item => !cwd || (cwd && item.path.startsWith(`${cwd}/`)))
      .map(({ path, isDir, ram, flash }) => {
        const relativePath = path.substring(cwd ? cwd.length + 1 : 0);
        const relativePathParts = relativePath.split('/');

        let name = relativePathParts[0];
        if (!cwd && !name.length) {
          // Fix displaying unir root(/) folder items
          name = `/${relativePathParts[1]}`;
        }

        dirUnfolder.remember(relativePath);
        aggregator.increment(name, { flash, ram });

        return {
          isDir: relativePathParts.length !== 1 || isDir,
          flash,
          ram,
          relativePath: name
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
      <div>
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
          <MemorySymbols
            file={selectedFile.path}
            symbols={selectedFile.symbols}
            openTextDocument={this.props.openTextDocument}
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

const dispatchToProps = {
  openTextDocument
};

export default connect(mapStateToProps, dispatchToProps)(FileExplorerPage);
