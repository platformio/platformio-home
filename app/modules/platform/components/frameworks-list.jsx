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

import { Button, Card, Input, Spin } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';

export default class FrameworksList extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object.isRequired),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired
  };

  componentDidMount() {
    if (this._searchInputElement) {
      this._searchInputElement.focus();
    }
  }

  onDidFilter(value) {
    this.props.setFilter(value);
  }

  onDidShow(e, name) {
    e.stopPropagation();
    this.props.showFramework(name);
  }

  onDidPlatform(e, name) {
    e.stopPropagation();
    this.props.showPlatform(name);
  }

  render() {
    if (!this.props.items) {
      return (
        <div className="text-center">
          <Spin tip="Loading..." size="large" />
        </div>
      );
    }

    return (
      <div>
        <Input.Search
          allowClear
          className="block"
          placeholder="Filter frameworks by name"
          defaultValue={this.props.filterValue}
          size="large"
          onChange={e => this.onDidFilter(e.target.value)}
          ref={elm => (this._searchInputElement = elm)}
        />
        {this.props.items && this.props.items.length === 0 && (
          <ul className="background-message text-center">
            <li>No Results</li>
          </ul>
        )}
        {this.props.items.map(item => this.renderItem(item))}
      </div>
    );
  }

  renderItem(item) {
    const title = <a onClick={e => this.onDidShow(e, item.name)}>{item.title}</a>;
    return (
      <Card
        hoverable
        key={item.name}
        title={title}
        onClick={e => this.onDidShow(e, item.name)}
        className="list-item-card"
      >
        <div className="block">{item.description}</div>
        <div className="inline-buttons">
          {(item.platforms || []).map(item => (
            <Button
              key={item.title}
              icon="appstore"
              size="small"
              onClick={e => this.onDidPlatform(e, item.name)}
            >
              {item.title}
            </Button>
          ))}
        </div>
      </Card>
    );
  }
}
