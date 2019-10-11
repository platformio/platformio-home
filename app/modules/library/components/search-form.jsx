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

import { Button, Input } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';

export default class LibrarySearchForm extends React.Component {
  static propTypes = {
    searchLibrary: PropTypes.func.isRequired,
    defaultSearch: PropTypes.string
  };

  constructor() {
    super(...arguments);
    this.state = {
      searchQuery: ''
    };
  }

  componentDidMount() {
    if (this._searchInputElement) {
      this._searchInputElement.focus();
    }
  }

  onQueryChange(value) {
    this.setState({
      searchQuery: value
    });
  }

  onDidSearch() {
    this.props.searchLibrary(this.state.searchQuery);
  }

  render() {
    return (
      <div className="lib-search-from">
        <Input.Search
          key={this.props.defaultSearch}
          enterButton
          placeholder="Search libraries..."
          defaultValue={this.props.defaultSearch}
          size="large"
          onChange={e => this.onQueryChange(e.target.value)}
          onSearch={::this.onDidSearch}
          ref={elm => (this._searchInputElement = elm)}
        />
        <div className="block search-tips">
          <Button
            size="small"
            icon="search"
            onClick={() => this.props.searchLibrary('tft display')}
            title='Search in "library.json" fields'
          >
            tft display
          </Button>
          <Button
            size="small"
            icon="search"
            onClick={() => this.props.searchLibrary('dht*')}
            title="Search for libraries that support DHT ICs (DHT11, DHT22)"
          >
            dht*
          </Button>
          <Button
            size="small"
            icon="search"
            onClick={() => this.props.searchLibrary('header:RH_ASK.h')}
            title="Search by header files (#inculde)"
          >
            header:RH_ASK.h
          </Button>
          <Button
            size="small"
            icon="search"
            onClick={() => this.props.searchLibrary('keyword:mqtt')}
            title="Filter libraries by keyword"
          >
            keyword:mqtt
          </Button>
          <Button
            size="small"
            icon="search"
            onClick={() => this.props.searchLibrary('framework:mbed')}
            title="ARM mbed based libraries"
          >
            framework:mbed
          </Button>
          <Button
            size="small"
            icon="search"
            onClick={() => this.props.searchLibrary('platform:espressif8266')}
            className="btn btn-default btn-xs icon icon-search"
            title="Search for Espressif 8266 compatible libraries"
          >
            platform:espressif8266
          </Button>
          <a href="http://docs.platformio.org/page/userguide/lib/cmd_search.html">
            more...
          </a>
        </div>
      </div>
    );
  }
}
