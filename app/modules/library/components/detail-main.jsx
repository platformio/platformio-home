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

import * as path from '../../core/path';

import {
  Button,
  Col,
  Dropdown,
  Icon,
  Menu,
  Popconfirm,
  Row,
  Select,
  Tabs,
  Tooltip
} from 'antd';

import LibraryDetailExamplesBlock from '../containers/detail-examples-block';
import LibraryDetailHeadersBlock from '../containers/detail-headers-block';
import LibraryDetailInstallationBlock from '../containers/detail-installation-block';
import LibraryDetailManifestBlock from '../containers/detail-manifest-block';
import LibraryInstallAdvancedModal from '../containers/install-advanced-modal';
import PropTypes from 'prop-types';
import React from 'react';
import RepositoryChangelog from '../../core/containers/repo-changelog';
import humanize from 'humanize';

export default class LibraryDetailMain extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      homepage: PropTypes.string,
      repository: PropTypes.string,
      keywords: PropTypes.array.isRequired,
      authors: PropTypes.array.isRequired,
      platforms: PropTypes.array,
      frameworks: PropTypes.array,
      dlstats: PropTypes.object,
      version: PropTypes.oneOfType([
        PropTypes.object, // registry library
        PropTypes.string // built-in/installed library
      ]).isRequired,
      versions: PropTypes.arrayOf(PropTypes.object),
      __src_url: PropTypes.string,
      __pkg_dir: PropTypes.string
    }),
    osOpenUrl: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    installLibrary: PropTypes.func.isRequired,
    uninstallLibrary: PropTypes.func.isRequired,
    showInstalledLibraries: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      installToVisible: false,
      installing: false,
      uninstalling: false,
      selectedVersion: null,
      activeTab: 'examples'
    };
  }

  onDidTabChange(activeTab) {
    this.setState({
      activeTab
    });
  }

  onDidVersionChange(value) {
    this.setState({
      selectedVersion: value
    });
  }

  onDidInstallTo() {
    this.setState({
      installToVisible: true
    });
  }

  onDidCancelInstallTo() {
    this.setState({
      installToVisible: false
    });
  }

  onDidInstall() {
    this.setState({
      installing: true
    });
    this.props.installLibrary(
      null, // global storage
      this.getLibraryForInstall(),
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
    this.props.uninstallLibrary(
      path.dirname(this.props.data.__pkg_dir),
      this.props.data.__pkg_dir,
      err => {
        this.setState({
          uninstalling: false
        });
        if (!err) {
          this.props.showInstalledLibraries();
        }
      }
    );
  }

  onDidAuthorSearch(name) {
    this.props.searchLibrary(`author:"${name}"`);
  }

  onDidFrameworkSearch(name) {
    this.props.searchLibrary(`framework:${name}`);
  }

  onDidPlatformSearch(name) {
    this.props.searchLibrary(`platform:${name}`);
  }

  onDidKeywordSearch(name) {
    this.props.searchLibrary(`keyword:"${name}"`);
  }

  getLibraryForInstall() {
    const latestVersion = this.props.data.versions.length
      ? this.props.data.versions[this.props.data.versions.length - 1].name
      : '';
    if (
      this.state.selectedVersion &&
      (!latestVersion || this.state.selectedVersion !== latestVersion)
    ) {
      return `id=${this.props.data.id}@${this.state.selectedVersion}`;
    }
    if (latestVersion.match(/^\d+\.\d+\.\d+$/)) {
      return `id=${this.props.data.id}@^${latestVersion}`;
    }
    return `id=${this.props.data.id}`;
  }

  renderQuickInstallation(versions) {
    return (
      <div>
        <LibraryInstallAdvancedModal
          library={this.getLibraryForInstall()}
          visible={this.state.installToVisible}
          onCancel={::this.onDidCancelInstallTo}
        />
        <h3>Installation</h3>
        <ul className="list-inline">
          <li>
            <Select
              defaultValue={versions[0].name}
              onChange={::this.onDidVersionChange}
            >
              {versions.map(item => (
                <Select.Option key={item.name} value={item.name} title={item.released}>
                  {item.component}
                </Select.Option>
              ))}
            </Select>
          </li>
          <li>
            <Dropdown.Button
              type="primary"
              overlay={
                <Menu onClick={::this.onDidInstallTo}>
                  <Menu.Item key="">Install to...</Menu.Item>
                </Menu>
              }
              disabled={this.state.installing}
              onClick={::this.onDidInstall}
            >
              <Icon type="download" /> Install
            </Dropdown.Button>
          </li>
          <li>|</li>
          <li>
            <a onClick={() => this.setState({ activeTab: 'installation' })}>
              More info
            </a>
          </li>
        </ul>
        <br />
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
    let versions = null;
    if (this.props.data.versions) {
      versions = this.props.data.versions
        .slice(0)
        .reverse()
        .map(item => {
          item.component = (
            <span>
              <strong>{item.name}</strong>{' '}
              <small>
                released{' '}
                {humanize.relativeTime(new Date(item.released).getTime() / 1000)}
              </small>
            </span>
          );
          return item;
        });
    }
    const authors = this.props.data.authors;
    return (
      <div>
        <h1>
          {this.props.data.name}{' '}
          {authors && authors.length && <small>by {authors[0].name}</small>}{' '}
          <small className="pull-right">{this.renderExtra()}</small>
        </h1>
        <div className="lead">{this.props.data.description}</div>
        {versions && this.renderQuickInstallation(versions)}
        <Row>
          <Col sm={18} className="library-subpages">
            <Tabs
              type="card"
              activeKey={this.state.activeTab}
              onChange={::this.onDidTabChange}
            >
              <Tabs.TabPane
                tab={
                  <span>
                    <Icon type="copy" />
                    Examples
                  </span>
                }
                key="examples"
              >
                <LibraryDetailExamplesBlock data={this.props.data} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <Icon type="cloud-download-o" />
                    Installation
                  </span>
                }
                key="installation"
              >
                <LibraryDetailInstallationBlock {...this.props} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <Icon type="file-add" />
                    Headers
                  </span>
                }
                key="headers"
              >
                <LibraryDetailHeadersBlock data={this.props.data} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={
                  <span>
                    <Icon type="edit" />
                    Manifest
                  </span>
                }
                key="manifest"
              >
                <LibraryDetailManifestBlock {...this.props} />
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
          <Col sm={6}>
            <h2>Tags</h2>
            <div className="inline-buttons">
              {this.props.data.keywords.map(name => (
                <Button
                  key={name}
                  icon="tag"
                  size="small"
                  onClick={() => this.onDidKeywordSearch(name)}
                >
                  {name}
                </Button>
              ))}
            </div>
            {this.props.data.platforms.length > 0 && (
              <div className="inline-buttons">
                <h2>Platforms</h2>
                {this.props.data.platforms.map(item => (
                  <Button
                    key={item.name}
                    icon="appstore"
                    size="small"
                    onClick={() => this.onDidPlatformSearch(item.name)}
                  >
                    {item.title}
                  </Button>
                ))}
              </div>
            )}
            {this.props.data.frameworks.length > 0 && (
              <div className="inline-buttons">
                <h2>Frameworks</h2>
                {this.props.data.frameworks.map(item => (
                  <Button
                    key={item.name}
                    icon="setting"
                    size="small"
                    onClick={() => this.onDidFrameworkSearch(item.name)}
                  >
                    {item.title}
                  </Button>
                ))}
              </div>
            )}
            <h2>Authors</h2>
            {this.props.data.authors.map(item => (
              <div key={item.name} className="library-author">
                <Icon type="book" />
                <a onClick={() => this.onDidAuthorSearch(item.name)}>
                  <strong>{item.name}</strong>{' '}
                  <span>{item.maintainer ? '(maintainer)' : ''}</span>
                </a>
                {item.email && (
                  <div>
                    <Icon type="mail" />
                    <a onClick={() => this.props.osOpenUrl(`mailto:${item.email}`)}>
                      {item.email}
                    </a>
                  </div>
                )}
                {item.url && (
                  <div>
                    <Icon type="link" />
                    <a onClick={() => this.props.osOpenUrl(item.url)}>{item.url}</a>
                  </div>
                )}
              </div>
            ))}
            <h2>Resources</h2>
            {this.props.data.id > 0 && (
              <div>
                <Icon type="link" />{' '}
                <a
                  onClick={() =>
                    this.props.osOpenUrl(
                      `https://platformio.org/lib/show/${this.props.data.id}/${this.props.data.name}`
                    )
                  }
                >
                  Registry
                </a>{' '}
                <small>
                  <kbd>ID: {this.props.data.id}</kbd>
                </small>
              </div>
            )}
            {this.props.data.homepage && (
              <div>
                <Icon type="home" />{' '}
                <a onClick={() => this.props.osOpenUrl(this.props.data.homepage)}>
                  Homepage
                </a>
              </div>
            )}
            {this.props.data.repository && (
              <div>
                <Icon type="github" />{' '}
                <a onClick={() => this.props.osOpenUrl(this.props.data.repository)}>
                  Repository
                </a>
              </div>
            )}
            {this.props.data.__src_url && (
              <div>
                <Icon type="github" />{' '}
                <a onClick={() => this.props.osOpenUrl(this.props.data.__src_url)}>
                  Source
                </a>
              </div>
            )}
            {this.props.data.dlstats && (
              <div>
                <h2>Downloads</h2>
                <b>{this.props.data.dlstats.day}</b> in the last day
                <br />
                <b>{this.props.data.dlstats.week}</b> in the last week
                <br />
                <b>{this.props.data.dlstats.month}</b> in the last month
              </div>
            )}
            {versions && (
              <div>
                <h2>Versions</h2>
                {versions.map(item => (
                  <div key={item.name}>
                    <Tooltip placement="left" title={item.released}>
                      {item.component}
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}
