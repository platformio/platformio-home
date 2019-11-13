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

import * as workspaceSettings from '../../../workspace/settings';

import { Alert, Button, Col, Icon, Popconfirm, Row, Select, Tabs, Tooltip } from 'antd';

import Boards from '../components/boards';
import PlatformDetailPackages from '../components/platform-packages';
import PlatformProjectExamples from '../containers/platform-examples';
import PropTypes from 'prop-types';
import React from 'react';
import RepositoryChangelog from '../../core/containers/repo-changelog';

export default class PlatformMain extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      name: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      url: PropTypes.string,
      docs: PropTypes.string,
      homepage: PropTypes.string.isRequired,
      repository: PropTypes.string,
      license: PropTypes.string,
      version: PropTypes.string,
      versions: PropTypes.arrayOf(PropTypes.string),
      frameworks: PropTypes.arrayOf(PropTypes.object),
      packages: PropTypes.arrayOf(PropTypes.object),
      boards: PropTypes.arrayOf(PropTypes.object),
      __src_url: PropTypes.string,
      __pkg_dir: PropTypes.string
    }),
    osRevealFile: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    showInstalledPlatforms: PropTypes.func.isRequired,
    installPlatform: PropTypes.func.isRequired,
    uninstallPlatform: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      installing: false,
      uninstalling: false,
      versionForInstall: null
    };
  }

  onDidReveal(dir) {
    this.props.osRevealFile(dir);
  }

  onDidVersionChange(value) {
    this.setState({
      versionForInstall: value
    });
  }

  onDidInstall() {
    this.setState({
      installing: true
    });
    this.props.installPlatform(
      this.state.versionForInstall
        ? `${this.props.data.name}@${this.state.versionForInstall}`
        : this.props.data.name,
      () =>
        this.setState({
          installing: false
        })
    );
  }

  onDidUninstall() {
    this.setState({
      uninstalling: true
    });
    this.props.uninstallPlatform(this.props.data.__pkg_dir, err => {
      this.setState({
        uninstalling: false
      });
      if (!err) {
        this.props.showInstalledPlatforms();
      }
    });
  }

  renderQuickInstallation(versions) {
    return (
      <div>
        <h3>Installation</h3>
        <ul className="block list-inline">
          <li>
            <Select
              defaultValue={versions[0]}
              dropdownMatchSelectWidth={false}
              onChange={::this.onDidVersionChange}
            >
              {versions.map(name => (
                <Select.Option key={name} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </li>
          <li>
            <Button
              icon="download"
              type="primary"
              loading={this.state.installing}
              disabled={this.state.installing}
              onClick={::this.onDidInstall}
            >
              Install
            </Button>
          </li>
        </ul>
      </div>
    );
  }

  renderExtra() {
    if (!this.props.data.__pkg_dir) {
      return null;
    }
    return (
      <ul className="list-inline" style={{ marginTop: '9px' }}>
        <li>
          <Tooltip title="Version">
            <Icon
              type={this.props.data.__src_url ? 'fork' : 'environment-o'}
              className="inline-block-tight"
            />
            {this.props.data.version}
          </Tooltip>
        </li>
        <li>
          <Button.Group>
            <Button
              type="primary"
              icon="folder"
              onClick={() => this.props.osRevealFile(this.props.data.__pkg_dir)}
            >
              Reveal
            </Button>
            <Popconfirm
              title="Are you sure?"
              okText="Yes"
              cancelText="No"
              onConfirm={::this.onDidUninstall}
            >
              <Button
                type="primary"
                icon="delete"
                loading={this.state.uninstalling}
                disabled={this.state.uninstalling}
              >
                Uninstall
              </Button>
            </Popconfirm>
          </Button.Group>
        </li>
      </ul>
    );
  }

  render() {
    return (
      <div>
        <h1>
          {this.props.data.title}{' '}
          <small className="pull-right">{this.renderExtra()}</small>
        </h1>
        <div className="lead">{this.props.data.description}</div>
        {this.props.data.versions &&
          this.renderQuickInstallation(this.props.data.versions.slice(0).reverse())}
        <Row>
          <Col sm={20} className="tabs-block">
            <Tabs type="card">
              <Tabs.TabPane
                tab={
                  <span>
                    {workspaceSettings.getCustomIcon('calculator')}
                    {workspaceSettings.getMessage('Boards')}
                  </span>
                }
                key="boards"
              >
                <Boards
                  items={this.props.data.boards}
                  noHeader
                  excludeColumns={['Platform']}
                  showPlatform={this.props.showPlatform}
                  showFramework={this.props.showFramework}
                  osOpenUrl={this.props.osOpenUrl}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <Icon type="copy" />
                    Examples
                  </span>
                }
                key="examples"
              >
                {this.props.data.__pkg_dir ? (
                  <PlatformProjectExamples pkgDir={this.props.data.__pkg_dir} />
                ) : (
                  <Alert
                    type="error"
                    showIcon
                    message={
                      <span>
                        Examples avaiable only for{' '}
                        <a onClick={() => this.props.showInstalledPlatforms()}>
                          installed platforms
                        </a>
                        .
                      </span>
                    }
                  />
                )}
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <Icon type="appstore-o" />
                    Packages
                  </span>
                }
                key="packages"
              >
                <PlatformDetailPackages
                  items={this.props.data.packages}
                  osOpenUrl={this.props.osOpenUrl}
                  showInstalledPlatforms={this.props.showInstalledPlatforms}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <Icon type="clock-circle-o" />
                    Changelog
                  </span>
                }
                key="changelog"
              >
                <RepositoryChangelog uri={this.props.data.repository} />
              </Tabs.TabPane>
            </Tabs>
          </Col>
          <Col sm={4}>
            <h2>Frameworks</h2>
            <ul className="resources-list">
              {this.props.data.frameworks.map(item => (
                <li key={item.name}>
                  <Button
                    icon="setting"
                    size="small"
                    onClick={() => this.props.showFramework(item.name)}
                  >
                    {item.title}
                  </Button>
                </li>
              ))}
            </ul>
            <h2>Resources</h2>
            <ul className="resources-list">
              <li>
                <kbd>platform = {this.props.data.name}</kbd>
              </li>
              <li>
                <Icon type="home" />{' '}
                <a onClick={() => this.props.osOpenUrl(this.props.data.homepage)}>
                  Homepage
                </a>
              </li>
              {this.props.data.repository && (
                <li>
                  <Icon type="github" />{' '}
                  <a onClick={() => this.props.osOpenUrl(this.props.data.repository)}>
                    Repository
                  </a>
                </li>
              )}
              <li>
                <Icon type="info-circle-o" />{' '}
                <a
                  onClick={() =>
                    this.props.osOpenUrl(
                      this.props.data.docs ||
                        `http://docs.platformio.org/page/platforms/${this.props.data.name}.html`
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
              {this.props.data.license && (
                <li>
                  <Icon type="copyright" className="inline-block-tight" />
                  <a
                    onClick={() =>
                      this.props.osOpenUrl(
                        `https://opensource.org/licenses/${this.props.data.license}`
                      )
                    }
                  >
                    {this.props.data.license}
                  </a>
                </li>
              )}
              {this.props.data.__src_url && (
                <li>
                  <Icon type="github" />{' '}
                  <a onClick={() => this.props.osOpenUrl(this.props.data.__src_url)}>
                    Source
                  </a>
                </li>
              )}
              {this.props.data.versions && (
                <li>
                  <h2>Versions</h2>
                  <ul>
                    {this.props.data.versions
                      .slice(0)
                      .reverse()
                      .map(name => (
                        <li key={name}>
                          <Icon type="environment-o" className="inline-block-tight" />
                          {name}
                        </li>
                      ))}
                  </ul>
                </li>
              )}
            </ul>
          </Col>
        </Row>
      </div>
    );
  }
}
