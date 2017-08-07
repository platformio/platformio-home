/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Card, Col, Icon, Row, Tooltip } from 'antd';

import { LibraryStorage } from '../storage';
import PropTypes from 'prop-types';
import React from 'react';


export default class LibraryStorageItem extends React.Component {

  static propTypes = {
    item: PropTypes.shape({
      name: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
      versionLatest: PropTypes.string,
      description: PropTypes.string,
      url: PropTypes.string,
      keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
      authors: PropTypes.arrayOf(PropTypes.object),
      __src_url: PropTypes.string,
    }),
    onShow: PropTypes.func.isRequired,
    onReveal: PropTypes.func.isRequired,
    onUninstall: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    actions: PropTypes.number.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      actionInProgress: false,
      componentMounted: false
    };
  }

  componentDidMount() {
    this.setState({
      componentMounted: true
    });
  }

  componentWillUnmount() {
    this.setState({
      componentMounted: false
    });
  }

  onDidShow(event, item) {
    event.stopPropagation();
    this.props.onShow(item);
  }

  onDidKeywordSearch(event, name) {
    event.stopPropagation();
    this.props.onSearch(`keyword:"${name}"`);
  }

  onDidUninstallOrUpdateItem(event, cmd) {
    event.stopPropagation();
    this.setState({
      actionInProgress: true
    });
    (cmd === 'uninstall' ? this.props.onUninstall : this.props.onUpdate)(
      () => this.state.componentMounted ? this.setState({
        actionInProgress: false
      }) : {}
    );
  }

  render() {
    const title = (
    <h2><a onClick={ (e) => this.onDidShow(e, this.props.item) }>{ this.props.item.name }</a> <small>{ this.props.item.authors && this.props.item.authors.length ? ` by ${ this.props.item.authors[0].name }` : '' }</small></h2>
    );
    const extra = <span><Tooltip title='Version'><Icon type={ this.props.item.__src_url ? 'fork' : 'environment-o' } /> { this.props.item.version }</Tooltip></span>;
    return (
      <Card title={ title }
        extra={ extra }
        onClick={ (e) => this.onDidShow(e, this.props.item) }
        className='list-item-card'>
        <div className='block'>
          { this.props.item.description || this.props.item.url }
        </div>
        <Row>
          <Col sm={ 16 }>
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
          </Col>
          <Col sm={ 8 } className='text-right text-nowrap'>
            <Button.Group>
              { this.props.onReveal && this.props.actions & LibraryStorage.ACTION_REVEAL ? (
                <Button type='primary' icon='folder' onClick={ (e) => this.props.onReveal(e) }>
                  Reveal
                </Button>
                ) : ('') }
              { this.props.onUninstall && this.props.actions & LibraryStorage.ACTION_UNINSTALL ? (
                <Button type='primary'
                  icon='delete'
                  loading={ this.state.actionInProgress }
                  disabled={ this.state.actionInProgress }
                  onClick={ (e) => this.onDidUninstallOrUpdateItem(e, 'uninstall') }>
                  Uninstall
                </Button>
                ) : ('') }
              { this.props.onUpdate && this.props.actions & LibraryStorage.ACTION_UPDATE ? (
                <Button type='primary'
                  icon='cloud-download-o'
                  loading={ this.state.actionInProgress }
                  disabled={ this.state.actionInProgress }
                  onClick={ (e) => this.onDidUninstallOrUpdateItem(e, 'update') }>
                  { this.props.item.versionLatest ? `Update to ${this.props.item.versionLatest}` : 'Update' }
                </Button>
                ) : ('') }
            </Button.Group>
          </Col>
        </Row>
      </Card>
      );
  }

}
