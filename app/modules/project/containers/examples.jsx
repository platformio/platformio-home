/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as path from '../../core/path';

import CodeBeautifier from '../../core/containers/code-beautifier';
import PropTypes from 'prop-types';
import React from 'react';
import { Select } from 'antd';
import { cmpSort } from '../../core/helpers';


export class ProjectExampleItem {

  constructor(name, projectPath = undefined) {
    this.name = name;
    this.projectPath  = projectPath;
    this._sources = [];
  }

  addSource(uri, title = undefined) {
    if (!title) {
      title = path.basename(uri);
    }
    this._sources.push({
      uri,
      title
    });
  }

  getSources() {
    return this._sources.sort((a, b) => cmpSort(a.title.toUpperCase(), b.title.toUpperCase()));
  }
}


export class ProjectExamples extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.instanceOf(ProjectExampleItem).isRequired
    ),
  }

  constructor() {
    super(...arguments);
    this.state = {
      sources: []
    };
  }

  componentWillMount() {
    this.setState({
      sources: this.props.items.length ? this.props.items[0].getSources() : []
    });
  }

  onDidChange(name) {
    this.setState({
      sources: this.props.items[this.props.items.findIndex(item => item.name === name)].getSources()
    });
  }

  onDidFilter(inputValue, option) {
    if (!inputValue) {
      return true;
    }
    return option.props.value.toLowerCase().includes(inputValue);
  }

  render() {
    if (!this.props.items.length) {
      return (
        <ul className='background-message text-center'>
          <li>
            No items
          </li>
        </ul>
        );
    }
    return (
      <div>
        <div className='block'>
          <Select showSearch={ true }
            defaultValue={ this.props.items[0].name }
            filterOption={ ::this.onDidFilter }
            onChange={ ::this.onDidChange }
            style={ { width: '100%' } }>
            { this.props.items.map(item => (
                <Select.Option key={ item.name } value={ item.name }>
                  { item.name }
                </Select.Option>
              )) }
          </Select>
        </div>
        { this.state.sources.map((item, index) => (
            <CodeBeautifier key={ item.uri }
              className='block'
              title={ (this.state.sources.length > 1 ? `${ index + 1 }. ` : '') + item.title }
              uri={ item.uri }
              language={ item.uri.endsWith('.ini') ? 'ini' : 'c' }
              toggle />
          )) }
      </div>
      );
  }

}
