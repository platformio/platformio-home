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

import { Card, Icon, Tooltip } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';

export default class LibrarySearchCard extends React.Component {
  static propTypes = {
    item: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      examplenums: PropTypes.number.isRequired,
      dllifetime: PropTypes.number.isRequired,
      frameworks: PropTypes.arrayOf(PropTypes.object).isRequired,
      platforms: PropTypes.arrayOf(PropTypes.object).isRequired,
      keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
      authornames: PropTypes.arrayOf(PropTypes.string).isRequired
    }),
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired
  };

  componentWillUnmount() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
  }

  onDidShow(e, id) {
    e.stopPropagation();
    this.props.showLibrary(id);
  }

  onDidFilterSearch(e, filter, value) {
    e.stopPropagation();
    this.props.searchLibrary(`${filter}:"${value}"`);
  }

  render() {
    const header = (
      <div className="clearfix">
        <div className="pull-left">
          <a onClick={e => this.onDidShow(e, this.props.item.id)}>
            {this.props.item.name}
          </a>{' '}
          <small>
            by{' '}
            {this.props.item.authornames.length ? this.props.item.authornames[0] : ''}
          </small>
        </div>
        <small className="pull-right list-item-card-head-extra">
          {this.renderExtraHead()}
        </small>
      </div>
    );
    return (
      <Card
        hoverable
        title={header}
        onClick={e => this.onDidShow(e, this.props.item.id)}
        className="list-item-card"
      >
        <div className="block">{this.props.item.description}</div>
        <div>
          <Icon type="tag" className="inline-block-tight" />
          {this.renderKeywords(this.props.item.keywords)}
        </div>
        <div>
          <Tooltip title="Compatible platforms">
            <Icon type="appstore" className="inline-block-tight" />
            {this.renderFrameworksOrPlatforms(this.props.item.platforms, 'platform')}
          </Tooltip>
        </div>
      </Card>
    );
  }

  renderExtraHead() {
    return (
      <ul className="list-inline">
        <li>
          <Tooltip title="Downloads">
            <Icon type="download" className="inline-block-tight" />
            {this.props.item.dllifetime.toLocaleString()}
          </Tooltip>
        </li>
        <li>
          <Tooltip title="Total examples">
            <Icon type="copy" className="inline-block-tight" />
            {this.props.item.examplenums}
          </Tooltip>
        </li>
        <li>
          <Tooltip title="Compatible frameworks">
            <Icon type="setting" className="inline-block-tight" />
            {this.renderFrameworksOrPlatforms(this.props.item.frameworks, 'framework')}
          </Tooltip>
        </li>
      </ul>
    );
  }

  renderFrameworksOrPlatforms(items, filter) {
    return (
      <span>
        {items.map((item, index) => (
          <a
            key={item.name}
            onClick={e => this.onDidFilterSearch(e, filter, item.name)}
          >
            {item.title}
            {index < items.length - 1 ? ', ' : ''}
          </a>
        ))}
      </span>
    );
  }

  renderKeywords(items) {
    return (
      <span>
        {items.map((name, index) => (
          <a key={name} onClick={e => this.onDidFilterSearch(e, 'keyword', name)}>
            {name}
            {index < items.length - 1 ? ', ' : ''}
          </a>
        ))}
      </span>
    );
  }
}
