/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Card, Input, Spin } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';


export default class FrameworksList extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired
  }

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
        <div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }

    return (
      <div>
        <Input className='block input-search-lg'
          placeholder='Filter frameworks by name'
          defaultValue={ this.props.filterValue }
          size='large'
          onChange={ e => this.onDidFilter(e.target.value) }
          ref={ elm => this._searchInputElement = elm } />
        { this.props.items && this.props.items.length === 0 &&
          <ul className='background-message text-center'>
            <li>
              No Results
            </li>
          </ul> }
        <br />
        { this.props.items.map(item => this.renderItem(item)) }
      </div>
      );
  }

  renderItem(item) {
    const title = (
    <a onClick={ (e) => this.onDidShow(e, item.name) }>{ item.title }</a>
    );
    return (
      <Card key={ item.name } title={ title }
        onClick={ (e) => this.onDidShow(e, item.name) }
        className='list-item-card'>
        <div className='block'>
          { item.description }
        </div>
        <div className='inline-buttons'>
          { (item.platforms || []).map(item => (
              <Button key={ item.title }
                icon='desktop'
                size='small'
                onClick={ (e) => this.onDidPlatform(e, item.name) }>
                { item.title }
              </Button>
            )) }
        </div>
      </Card>

      );
  }

}
