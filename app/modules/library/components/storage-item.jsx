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

import { Button, Card, Col, Icon, Popconfirm, Row, Tooltip } from 'antd';

import { LibraryStorage } from '../storage';
import PropTypes from 'prop-types';
import React from 'react';

export default class LibraryStorageItem extends React.Component {
  static propTypes = {
    item: PropTypes.shape({
      name: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
      versionWanted: PropTypes.string,
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
    actions: PropTypes.number.isRequired,
  };

  constructor() {
    super(...arguments);
    this.state = {
      actionInProgress: false,
      componentMounted: false,
    };
  }

  componentDidMount() {
    this.setState({
      componentMounted: true,
    });
  }

  componentWillUnmount() {
    this.setState({
      componentMounted: false,
    });
  }

  onDidShow(e, item) {
    e.stopPropagation();
    this.props.onShow(item);
  }

  onDidKeywordSearch(e, name) {
    e.stopPropagation();
    this.props.onSearch(`keyword:"${name}"`);
  }

  onDidUninstallOrUpdateItem(e, cmd) {
    e.stopPropagation();
    this.setState({
      actionInProgress: true,
    });
    (cmd === 'uninstall' ? this.props.onUninstall : this.props.onUpdate)(() =>
      this.state.componentMounted
        ? this.setState({
            actionInProgress: false,
          })
        : {}
    );
  }

  render() {
    const title = (
      <div>
        <a onClick={(e) => this.onDidShow(e, this.props.item)}>
          {this.props.item.name}
        </a>{' '}
        <small>
          {this.props.item.authors && this.props.item.authors.length
            ? ` by ${this.props.item.authors[0].name}`
            : ''}
        </small>
      </div>
    );
    const extra = (
      <span>
        <Tooltip title="Version">
          {' '}
          <Icon type={this.props.item.__src_url ? 'fork' : 'environment-o'} />{' '}
          {this.props.item.version}{' '}
        </Tooltip>
      </span>
    );
    return (
      <Card
        title={title}
        hoverable
        extra={extra}
        onClick={(e) => this.onDidShow(e, this.props.item)}
        className="list-item-card"
      >
        <div className="block">
          {this.props.item.description || this.props.item.url}
        </div>
        <Row>
          <Col sm={16}>
            <div className="inline-buttons">
              {(this.props.item.keywords || []).map((name) => (
                <Button
                  key={name}
                  icon="tag"
                  size="small"
                  onClick={(e) => this.onDidKeywordSearch(e, name)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </Col>
          <Col sm={8} className="text-right text-nowrap">
            <Button.Group>
              {this.props.onReveal &&
              this.props.actions & LibraryStorage.ACTION_REVEAL ? (
                <Button
                  type="primary"
                  icon="folder"
                  onClick={(e) => this.props.onReveal(e)}
                >
                  Reveal
                </Button>
              ) : (
                ''
              )}
              {this.props.onUninstall &&
              this.props.actions & LibraryStorage.ACTION_UNINSTALL ? (
                <Popconfirm
                  title="Are you sure?"
                  okText="Yes"
                  cancelText="No"
                  onCancel={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onConfirm={(e) => this.onDidUninstallOrUpdateItem(e, 'uninstall')}
                >
                  <Button
                    type="primary"
                    icon="delete"
                    loading={this.state.actionInProgress}
                    disabled={this.state.actionInProgress}
                  >
                    Uninstall
                  </Button>
                </Popconfirm>
              ) : (
                ''
              )}
              {this.props.onUpdate &&
              this.props.actions & LibraryStorage.ACTION_UPDATE ? (
                <Button
                  type="primary"
                  icon="cloud-download-o"
                  loading={this.state.actionInProgress}
                  disabled={
                    this.state.actionInProgress ||
                    (this.props.item.versionWanted &&
                      this.props.item.versionWanted !== this.props.item.versionLatest)
                  }
                  onClick={(e) => this.onDidUninstallOrUpdateItem(e, 'update')}
                >
                  {this.props.item.versionWanted
                    ? `Update to ${this.props.item.versionLatest}${
                        this.props.item.versionWanted &&
                        this.props.item.versionWanted !== this.props.item.versionLatest
                          ? ' (incompatible)'
                          : ''
                      }`
                    : 'Update'}
                </Button>
              ) : (
                ''
              )}
            </Button.Group>
          </Col>
        </Row>
      </Card>
    );
  }
}
