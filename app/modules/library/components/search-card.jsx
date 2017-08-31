/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Card, Icon, Tooltip } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';


export default class LibrarySearchCard extends React.Component {

  static propTypes = {
    item: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      examplenums: PropTypes.number.isRequired,
      dlmonth: PropTypes.number.isRequired,
      frameworks: PropTypes.arrayOf(PropTypes.object).isRequired,
      keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
      authornames: PropTypes.arrayOf(PropTypes.string).isRequired
    }),
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired
  }

  componentWillUnmount() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
  }

  onDidShow(e, id) {
    e.stopPropagation();
    this.props.showLibrary(id);
  }

  onDidKeywordSearch(e, name) {
    e.stopPropagation();
    this.props.searchLibrary(`keyword:"${name}"`);
  }

  render() {
    const title = (
    <div><a onClick={ (e) => this.onDidShow(e, this.props.item.id) }>{ this.props.item.name }</a> <small>by { this.props.item.authornames.length ? this.props.item.authornames[0] : '' }</small></div>
    );
    const extra = (
    <ul className='list-inline text-nowrap'>
      <li>
        <Tooltip title='Compatible frameworks'>
          <Icon type='setting' />
          { ' ' + this.props.item.frameworks.map(item => item.title).join(', ') }
        </Tooltip>
      </li>
      <li>
        <Tooltip title='Total examples'>
          <Icon type='copy' />
          { ' ' + this.props.item.examplenums }
        </Tooltip>
      </li>
      <li>
        <Tooltip title='Unique downloads per month'>
          <Icon type='download' />
          { ' ' + this.props.item.dlmonth.toLocaleString() }
        </Tooltip>
      </li>
    </ul>
    );
    return (
      <Card title={ title }
        extra={ extra }
        onClick={ (e) => this.onDidShow(e, this.props.item.id) }
        className='list-item-card'>
        <div className='block'>
          { this.props.item.description }
        </div>
        <div className='inline-buttons'>
          { this.props.item.keywords.map(name => (
              <Button key={ name }
                icon='tag'
                size='small'
                onClick={ (e) => this.onDidKeywordSearch(e, name) }>
                { name }
              </Button>
            )) }
        </div>
      </Card>
      );
  }

}
