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

import { Button, Col, Divider, Icon, Row, Tooltip } from 'antd';

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
      updated: PropTypes.array.isRequired,
    }),
    osOpenUrl: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
  };

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
    this.props.osOpenUrl(
      'http://docs.platformio.org/page/librarymanager/creating.html'
    );
  }

  render() {
    return (
      <div>
        <div className="text-right">
          <Button.Group>
            <Button
              ghost
              type="primary"
              icon="code-o"
              onClick={() => this.props.searchLibrary('')}
            >
              All Libraries
            </Button>
            <Button ghost type="primary" icon="file-add" onClick={::this.onDidRegister}>
              Publish
            </Button>
          </Button.Group>
        </div>

        <Divider style={{ marginTop: 0 }}>Recently</Divider>
        <Row>
          <Col span={8}>
            <h3>Updated</h3>
            <ul>
              {this.props.data.updated.map((item) => (
                <li key={item.id}>
                  <a
                    className="inline-block-tight"
                    onClick={() => this.props.showLibrary(item.id)}
                  >
                    {item.name}
                  </a>
                  <small title={item.date}>
                    {humanize.relativeTime(new Date(item.date).getTime() / 1000)}
                  </small>
                </li>
              ))}
            </ul>
          </Col>
          <Col span={8}>
            <h3>Added</h3>
            <ul>
              {this.props.data.added.map((item) => (
                <li key={item.id}>
                  <a
                    className="inline-block-tight"
                    onClick={() => this.props.showLibrary(item.id)}
                  >
                    {item.name}
                  </a>
                  <small title={item.date}>
                    {humanize.relativeTime(new Date(item.date).getTime() / 1000)}
                  </small>
                </li>
              ))}
            </ul>
          </Col>
          <Col span={8}>
            <h3>Keywords</h3>
            <ul className="last-keywords">
              {this.props.data.lastkeywords.map((name) => (
                <li key={name}>
                  <Button
                    icon="tag"
                    size="small"
                    onClick={() => this.onDidKeywordSearch(name)}
                  >
                    {name}
                  </Button>
                </li>
              ))}
            </ul>
          </Col>
        </Row>

        <Divider>Popular Tags</Divider>
        <div className="inline-buttons">
          {this.props.data.topkeywords.map((name, index) => (
            <Button
              key={name}
              icon="tag"
              size={this.getKeywordBtnSize(index)}
              onClick={() => this.onDidKeywordSearch(name)}
            >
              {name}
            </Button>
          ))}
        </div>

        <Divider>Trending</Divider>
        <Row className="trending">
          <Col span={8}>
            <h3>Today</h3>
            <ul>
              {this.props.data.dlday.map((item) => (
                <li key={item.id}>
                  <Tooltip title={`+${item.diff}, total: ${item.total}`}>
                    <Icon type="caret-up" size="small" />
                  </Tooltip>
                  <a onClick={() => this.props.showLibrary(item.id)}>{item.name}</a>
                </li>
              ))}
            </ul>
          </Col>
          <Col span={8}>
            <h3>Week</h3>
            <ul>
              {this.props.data.dlweek.map((item) => (
                <li key={item.id}>
                  <Tooltip title={`+${item.diff}, total: ${item.total}`}>
                    <Icon type="caret-up" size="small" />
                  </Tooltip>
                  <a onClick={() => this.props.showLibrary(item.id)}>{item.name}</a>
                </li>
              ))}
            </ul>
          </Col>
          <Col span={8}>
            <h3>Month</h3>
            <ul>
              {this.props.data.dlmonth.map((item) => (
                <li key={item.id}>
                  <Tooltip title={`+${item.diff}, total: ${item.total}`}>
                    <Icon type="caret-up" size="small" />
                  </Tooltip>
                  <a onClick={() => this.props.showLibrary(item.id)}>{item.name}</a>
                </li>
              ))}
            </ul>
          </Col>
        </Row>
      </div>
    );
  }
}
