/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Col, Icon, Row, Tooltip } from 'antd';

import LibraryInstallAdvancedModal from '../containers/install-advanced-modal';
import PropTypes from 'prop-types';
import React from 'react';
import humanize from 'humanize';

export default class LibraryStats extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      added: PropTypes.array.isRequired,
      dlday: PropTypes.array.isRequired,
      dlmonth: PropTypes.array.isRequired,
      dlweek: PropTypes.array.isRequired,
      lastkeywords: PropTypes.array.isRequired,
      topkeywords: PropTypes.array.isRequired,
      updated: PropTypes.array.isRequired
    }),
    openUrl: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      advancedVisible: false
    };
  }

  getKeywordBtnSize(index) {
    if (index < 10) {
      return 'large';
    } else if (index < 25) {
      return 'default';
    }
    return 'small';
  }

  onDidKeywordSearch(name) {
    return this.props.searchLibrary(`keyword:"${name}"`);
  }

  onDidRegister() {
    this.props.openUrl('http://docs.platformio.org/page/librarymanager/creating.html');
  }

  onDidAdvanced() {
    this.setState({
      advancedVisible: true
    });
  }

  onDidCancelAdvanced() {
    this.setState({
      advancedVisible: false
    });
  }

  render() {
    const title_with_buttons = (
    <Row>
      <Col span={ 12 }>
        Recently
      </Col>
      <Col className='text-right'>
        <Button.Group>
          <Button ghost type='primary' icon='code-o' onClick={ () => this.props.searchLibrary('') }>
            All Libraries
          </Button>
          <Button ghost type='primary' icon='file-add' onClick={ ::this.onDidRegister }>
            Register
          </Button>
          <Button ghost type='primary' icon='download' loading={ this.state.advancedOpened } disabled={ this.state.advancedOpened } onClick={ ::this.onDidAdvanced }>
            Advanced
          </Button>
        </Button.Group>
      </Col>
    </Row>
    );

    return (
      <div>
        <LibraryInstallAdvancedModal visible={ this.state.advancedVisible } onCancel={ ::this.onDidCancelAdvanced } />
        <h2>{ title_with_buttons }</h2>
        <Row>
          <Col span={ 8 }>
            <h3>Updated</h3>
            <ul>
              { this.props.data.updated.map((item) => (
                  <li key={ item.name }>
                    <a onClick={ () => this.props.showLibrary(item.id) }>
                      { item.name }
                    </a>
                    <small title={ item.date }>{ ' ' + humanize.relativeTime(new Date(item.date).getTime() / 1000) }</small>
                  </li>
                )) }
            </ul>
          </Col>
          <Col span={ 8 }>
            <h3>Added</h3>
            <ul>
              { this.props.data.added.map((item) => (
                  <li key={ item.name }>
                    <a onClick={ () => this.props.showLibrary(item.id) }>
                      { item.name }
                    </a>
                    <small title={ item.date }>{ ' ' + humanize.relativeTime(new Date(item.date).getTime() / 1000) }</small>
                  </li>
                )) }
            </ul>
          </Col>
          <Col span={ 8 }>
            <h3>Keywords</h3>
            <ul className='last-keywords'>
              { this.props.data.lastkeywords.map((name) => (
                  <li key={ name }>
                    <Button icon='tag' size='small' onClick={ () => this.onDidKeywordSearch(name) }>
                      { name }
                    </Button>
                  </li>
                )) }
            </ul>
          </Col>
        </Row>
        <h2>Popular Tags</h2>
        <div className='inline-buttons'>
          { this.props.data.topkeywords.map((name, index) => (
              <Button key={ name }
                icon='tag'
                size={ this.getKeywordBtnSize(index) }
                onClick={ () => this.onDidKeywordSearch(name) }
                className='inline-block-tight'>
                { name }
              </Button>
            )) }
        </div>
        <h2>Trending</h2>
        <Row className='trending'>
          <Col span={ 8 }>
            <h3>Today</h3>
            <ul>
              { this.props.data.dlday.map((item) => (
                  <li key={ item.id }>
                    <Tooltip title={ `+${item.diff}, total: ${item.total}` }>
                      <Icon type='caret-up' size='small' />
                    </Tooltip>
                    <a onClick={ () => this.props.showLibrary(item.id) }>
                      { item.name }
                    </a>
                  </li>
                )) }
            </ul>
          </Col>
          <Col span={ 8 }>
            <h3>Week</h3>
            <ul>
              { this.props.data.dlweek.map((item) => (
                  <li key={ item.id }>
                    <Tooltip title={ `+${item.diff}, total: ${item.total}` }>
                      <Icon type='caret-up' size='small' />
                    </Tooltip>
                    <a onClick={ () => this.props.showLibrary(item.id) }>
                      { item.name }
                    </a>
                  </li>
                )) }
            </ul>
          </Col>
          <Col span={ 8 }>
            <h3>Month</h3>
            <ul>
              { this.props.data.dlmonth.map((item) => (
                  <li key={ item.id }>
                    <Tooltip title={ `+${item.diff}, total: ${item.total}` }>
                      <Icon type='caret-up' size='small' />
                    </Tooltip>
                    <a onClick={ () => this.props.showLibrary(item.id) }>
                      { item.name }
                    </a>
                  </li>
                )) }
            </ul>
          </Col>
        </Row>
      </div>
      );
  }

}
