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

import { Input, Spin } from 'antd';

import { LibraryStorage } from '../storage';
import LibraryStorageItems from './storage-items';
import PropTypes from 'prop-types';
import React from 'react';

export default class LibraryStoragesList extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.instanceOf(LibraryStorage).isRequired),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    uninstallLibrary: PropTypes.func.isRequired,
    updateLibrary: PropTypes.func.isRequired,
  };

  componentDidMount() {
    if (this._searchInputElement) {
      this._searchInputElement.focus();
    }
  }

  onDidFilter(value) {
    this.props.setFilter(value);
  }

  render() {
    if (!this.props.items) {
      return (
        <div className="text-center">
          <Spin tip="Loading..." size="large" />
        </div>
      );
    }
    if (!this.props.items.length) {
      return (
        <ul className="background-message text-center">
          <li>No Results</li>
        </ul>
      );
    }
    return (
      <div className="lib-storages-list">
        <Input.Search
          allowClear
          className="block"
          placeholder="Filter libraries by name..."
          defaultValue={this.props.filterValue}
          size="large"
          onChange={(e) => this.onDidFilter(e.target.value)}
          ref={(elm) => (this._searchInputElement = elm)}
        />
        <div>
          {this.props.items.map((item) => (
            <LibraryStorageItems
              item={item}
              key={item.name}
              osRevealFile={this.props.osRevealFile}
              searchLibrary={this.props.searchLibrary}
              showLibrary={this.props.showLibrary}
              uninstallLibrary={this.props.uninstallLibrary}
              updateLibrary={this.props.updateLibrary}
            />
          ))}
        </div>
      </div>
    );
  }
}
