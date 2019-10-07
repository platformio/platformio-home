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

import * as actions from '../actions';
import * as pathlib from '@core/path';
import { MemoryExplorer } from '../components/memory-explorer';
import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { selectSizeDataForPath } from '../selectors';


class MemoryExplorerPage extends React.PureComponent {

  static propTypes = {
    saveTmpDatasize: PropTypes.func.isRequired,
    files: PropTypes.arrayOf(PropTypes.shape({
      flashSize: PropTypes.int,
      isDir: PropTypes.bool,
      path: PropTypes.string.isRequired,
      ramSize: PropTypes.int,
    }))
  }

  constructor(...args) {
    super(...args);

    this.state = {
      cwd: ''
    };
  }

  getItemsAtPath(cwd) {
    cwd = pathlib.ensureTrailingSlash(cwd);
    const {files: allFiles} = this.props;
    if (allFiles === undefined) {
      return undefined;
    }
    // const cwdParts = pathlib.split(cwd);
    const aggregateByPath = new Map();
    const paths = new Set();
    // const children = new Map();

    const result = allFiles
      // Left children
      .filter(x => x.path.startsWith(cwd))
      .map(({path, isDir, ramSize, flashSize}) => {
          // Convert path to relative
          const relativePath = path.substring(cwd.length);
          const relativePathParts = pathlib.split(relativePath);

          if (relativePathParts.length === 1) {
            return {
              relativePath: relativePathParts[0],
              isDir,
              ramSize,
              flashSize
            };
          }

          // Construct intermediate virtual directory
          return {
            isDir: true,
            relativePath: relativePathParts[0],
            ramSize,
              flashSize
          };
      })
      .filter(x  => {
        const { flashSize, ramSize } = x;
        // Left unique and calculate aggregate values
        if (paths.has(x.relativePath)) {
          const aggr = aggregateByPath.get(x.relativePath);
          aggr.flashSize += flashSize;
          aggr.ramSize += ramSize;
          return false;
        }
        paths.add(x.relativePath);
        aggregateByPath.set(x.relativePath, { flashSize, ramSize });
        return true;
      })
      // Override with aggregated values
      .map(x => {
        const aggr = aggregateByPath.get(x.relativePath);
        Object.assign(x, aggr);
        return x;
      })
      // // Dir first order
      .sort((a, b) => b.isDir - a.isDir);
      // .map(x => {
      //   if (!x.isDir) {
      //     return x;
      //   }
      //   const subDirs = [];
      //   let currentItems;
      //   let currentPath = x.path;
      //   while ((currentItems = this.getItemsAtPath(currentPath)) &&
      //       currentItems.length === 1 && currentItems[0].isDir) {

      //     currentPath = currentItems[0].path;
      //     console.warn('adding', currentItems[0]);
      //     subDirs.push(pathlib.basename(currentPath));
      //   }
      //   if (subDirs.length) {
      //     console.log('found additional subdirs', subDirs);
      //     x.path = pathlib.join(x.path, ...subDirs);
      //   }
      //   return x;
      // })

    return result;
  }

  handleTextAreaChange = (e) => {
    try {
      const json = JSON.parse(e.target.value);
      this.props.saveTmpDatasize(json);
    } catch (e) {
      if (!(e instanceof SyntaxError)) {
        throw e;
      }
    }
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

        <textarea style={{marginTop: 20}} rows="10" cols="80"
          onChange={this.handleTextAreaChange}
          ></textarea>
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


export default connect(mapStateToProps, actions)(MemoryExplorerPage);
