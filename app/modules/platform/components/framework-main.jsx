/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Col, Icon, Row, Spin, Tabs } from 'antd';

import Boards from '../components/boards';
import PropTypes from 'prop-types';
import React from 'react';


export default class FrameworkDetailPage extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      name: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      homepage: PropTypes.string.isRequired,
      url: PropTypes.string,
      platforms: PropTypes.arrayOf(PropTypes.object),
      boards: PropTypes.arrayOf(PropTypes.object)
    }),
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  render() {
    if (!this.props.data) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }
    return (
      <div>
        <h1>{ this.props.data.title }</h1>
        <div className='lead'>
          { this.props.data.description }
        </div>
        <Row>
          <Col sm={ 20 } className='tabs-block'>
            <Tabs type='card'>
              <Tabs.TabPane tab={ <span><Icon type='calculator' />Boards</span> } key='boards'>
                <Boards items={ this.props.data.boards }
                  noHeader
                  excludeColumns={ ['Frameworks'] }
                  showPlatform={ this.props.showPlatform }
                  showFramework={ this.props.showFramework }
                  osOpenUrl={ this.props.osOpenUrl } />
              </Tabs.TabPane>
            </Tabs>
          </Col>
          <Col sm={ 4 }>
            <h2>Platforms</h2>
            <ul className='resources-list'>
              { this.props.data.platforms.map(item => (
                <li key={ item.name }>
                  <Button
                    icon='appstore'
                    size='small'
                    onClick={ () => this.props.showPlatform(item.name) }>
                    { item.title }
                  </Button>
                </li>
                )) }
            </ul>
            <h2>Resources</h2>
            <ul className='resources-list'>
              <li>
                <kbd>framework = { this.props.data.name }</kbd>
              </li>
              <li>
                <Icon type='home' /> <a onClick={ () => this.props.osOpenUrl(this.props.data.homepage) }>Homepage</a>
              </li>
              <li>
                <Icon type='info-circle-o' /> <a onClick={ () => this.props.osOpenUrl(`http://docs.platformio.org/page/frameworks/${this.props.data.name}.html`) }>Documentation</a>
              </li>
              <li>
                <Icon type='link' /> <a onClick={ () => this.props.osOpenUrl(this.props.data.url) }>Vendor</a>
              </li>
            </ul>
          </Col>
        </Row>
      </div>
      );
  }
}
