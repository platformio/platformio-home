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
  };

  render() {
    if (!this.props.data) {
      return (
        <div className="text-center">
          <Spin tip="Loading..." size="large" />
        </div>
      );
    }
    return (
      <div>
        <h1>{this.props.data.title}</h1>
        <div className="lead">{this.props.data.description}</div>
        <Row>
          <Col sm={20} className="tabs-block">
            <Tabs type="card">
              <Tabs.TabPane
                tab={
                  <span>
                    <Icon type="calculator" />
                    Boards
                  </span>
                }
                key="boards"
              >
                <Boards
                  items={this.props.data.boards}
                  noHeader
                  excludeColumns={['Frameworks']}
                  showPlatform={this.props.showPlatform}
                  showFramework={this.props.showFramework}
                  osOpenUrl={this.props.osOpenUrl}
                />
              </Tabs.TabPane>
            </Tabs>
          </Col>
          <Col sm={4}>
            <h2>Platforms</h2>
            <ul className="resources-list">
              {this.props.data.platforms.map(item => (
                <li key={item.name}>
                  <Button
                    icon="appstore"
                    size="small"
                    onClick={() => this.props.showPlatform(item.name)}
                  >
                    {item.title}
                  </Button>
                </li>
              ))}
            </ul>
            <h2>Resources</h2>
            <ul className="resources-list">
              <li>
                <kbd>framework = {this.props.data.name}</kbd>
              </li>
              <li>
                <Icon type="home" />{' '}
                <a onClick={() => this.props.osOpenUrl(this.props.data.homepage)}>
                  Homepage
                </a>
              </li>
              <li>
                <Icon type="info-circle-o" />{' '}
                <a
                  onClick={() =>
                    this.props.osOpenUrl(
                      `http://docs.platformio.org/page/frameworks/${this.props.data.name}.html`
                    )
                  }
                >
                  Documentation
                </a>
              </li>
              <li>
                <Icon type="link" />{' '}
                <a onClick={() => this.props.osOpenUrl(this.props.data.url)}>Vendor</a>
              </li>
            </ul>
          </Col>
        </Row>
      </div>
    );
  }
}
