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

import PropTypes from 'prop-types';
import React from 'react';

export default class PlatformCard extends React.Component {
  static propTypes = {
    item: PropTypes.shape({
      name: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      version: PropTypes.string,
      versionLatest: PropTypes.object,
      frameworks: PropTypes.array,
      __src_url: PropTypes.string,
      __pkg_dir: PropTypes.string
    }),
    actions: PropTypes.arrayOf(PropTypes.string),
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    installPlatform: PropTypes.func.isRequired,
    uninstallPlatform: PropTypes.func.isRequired,
    updatePlatform: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired
  };

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

  onDidReveal(e) {
    e.stopPropagation();
    if (this.props.item.__pkg_dir) {
      this.props.osRevealFile(this.props.item.__pkg_dir);
    }
  }

  onDidShow(e) {
    e.stopPropagation();
    this.props.showPlatform(
      this.props.item.version
        ? `${this.props.item.name}@${this.props.item.version}`
        : this.props.item.name
    );
  }

  onDidInstall(e) {
    e.stopPropagation();
    const button = e.target;
    button.classList.add('btn-inprogress', 'disabled');
    this.props.installPlatform(this.props.item.name, () =>
      button.classList.remove('btn-inprogress', 'disabled')
    );
  }

  onDidUninstallOrUpdate(e, cmd) {
    e.stopPropagation();
    this.setState({
      actionInProgress: true
    });
    (cmd === 'uninstall' ? this.props.uninstallPlatform : this.props.updatePlatform)(
      this.props.item.__pkg_dir,
      () =>
        this.state.componentMounted
          ? this.setState({
              actionInProgress: false
            })
          : {}
    );
  }

  onDidFramework(e, name) {
    e.stopPropagation();
    this.props.showFramework(name);
  }

  render() {
    const title = <a onClick={::this.onDidShow}>{this.props.item.title}</a>;
    let extra;
    if (this.props.item.version) {
      extra = (
        <span>
          <Tooltip title="Version">
            {' '}
            <Icon type={this.props.item.__src_url ? 'fork' : 'environment-o'} />{' '}
            {this.props.item.version}{' '}
          </Tooltip>
        </span>
      );
    }
    return (
      <Card
        hoverable
        title={title}
        extra={extra}
        onClick={::this.onDidShow}
        className="list-item-card"
      >
        <div className="block">{this.props.item.description}</div>
        <Row>
          <Col sm={16}>
            <div className="inline-buttons">
              {(this.props.item.frameworks || []).map(item => (
                <Button
                  key={item.title}
                  icon="setting"
                  size="small"
                  onClick={e => this.onDidFramework(e, item.name)}
                >
                  {item.title}
                </Button>
              ))}
            </div>
          </Col>
          <Col sm={8} className="text-right text-nowrap">
            <Button.Group>
              {/* {this.props.actions && this.props.actions.includes('reveal') && (
                <Button type="primary" icon="folder" onClick={::this.onDidReveal}>
                  Reveal
                </Button>
              )} */}
              {this.props.actions && this.props.actions.includes('uninstall') && (
                <Popconfirm
                  title="Are you sure?"
                  okText="Yes"
                  cancelText="No"
                  onClick={e => e.stopPropagation()}
                  onConfirm={e => this.onDidUninstallOrUpdate(e, 'uninstall')}
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
              )}
              {this.props.actions && this.props.actions.includes('update') && (
                <Button
                  type="primary"
                  icon="cloud-download-o"
                  loading={this.state.actionInProgress}
                  disabled={this.state.actionInProgress}
                  onClick={e => this.onDidUninstallOrUpdate(e, 'update')}
                >
                  {this.props.item.versionLatest
                    ? `Update to ${this.props.item.versionLatest}`
                    : 'Update'}
                </Button>
              )}
            </Button.Group>
          </Col>
        </Row>
      </Card>
    );
  }
}
