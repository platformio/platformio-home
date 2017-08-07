/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Col, Icon, Row, Select, Tabs, Tooltip } from 'antd';

import LibraryDetailExamplesBlock from '../containers/detail-examples-block';
import LibraryDetailHeadersBlock from '../containers/detail-headers-block';
import LibraryDetailInstallationBlock from '../containers/detail-installation-block';
import LibraryDetailManifestBlock from '../containers/detail-manifest-block';
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
    openUrl: PropTypes.func.isRequired,
    revealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    installLibrary: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      installing: false,
      versionForInstall: null,
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
      versionForInstall: value
    });
  }

  onDidInstall() {
    const storageDir = null; // TODO: Custom storage directory
    this.setState({
      installing: true
    });
    this.props.installLibrary(
      storageDir,
      this.state.versionForInstall ? `${this.props.data.id}@${this.state.versionForInstall}` : this.props.data.id,
      () => this.setState({
        installing: false
      })
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

  renderQuickInstallation(versions) {
    return (
      <div>
        <h3>Installation</h3>
        <ul className='block list-inline'>
          <li>
            <Select defaultValue={ versions[0].name } onChange={ ::this.onDidVersionChange }>
              { versions.map(item => (
                  <Select.Option key={ item.name } value={ item.name } title={ item.released }>
                    { item.component }
                  </Select.Option>
                )) }
            </Select>
          </li>
          <li>
            <Button icon='download'
              type='primary'
              loading={ this.state.installing }
              disabled={ this.state.installing }
              onClick={ ::this.onDidInstall }>
              Install
            </Button>
          </li>
          <li>
            |
          </li>
          <li>
            <a onClick={ () => this.setState({
                           activeTab: 'installation'
                         }) }>More info</a>
          </li>
        </ul>
      </div>
      );
  }

  render() {
    let versions = null;
    if (this.props.data.versions) {
      versions = this.props.data.versions.slice(0).reverse().map(item => {
        item.component = <span><strong>{ item.name }</strong> <small>released { humanize.relativeTime(new Date(item.released).getTime() / 1000) }</small></span>;
        return item;
      });
    }
    let extra = '';
    if (this.props.data.authors && this.props.data.authors.length) {
      extra = <small>by { this.props.data.authors[0].name }</small>;
    }
    if (this.props.data.__pkg_dir && this.props.data.version) {
      extra = <span>{ extra }<small className='pull-right' style={{ marginTop: '15px' }}><Tooltip title='Version'><Icon type={ this.props.data.__src_url ? 'fork' : 'environment-o' } /> { this.props.data.version }</Tooltip></small></span>;
    }
    return (
      <div>
        <h1>{ this.props.data.name } { extra }</h1>
        <div className='lead'>
          { this.props.data.description }
        </div>
        { versions && this.renderQuickInstallation(versions) }
        <Row>
          <Col sm={ 18 } className='library-subpages'>
            <Tabs type='card' activeKey={ this.state.activeTab } onChange={ ::this.onDidTabChange }>
              <Tabs.TabPane tab={ <span><Icon type='copy' />Examples</span> } key='examples'>
                <LibraryDetailExamplesBlock data={ this.props.data } />
              </Tabs.TabPane>
              <Tabs.TabPane tab={ <span><Icon type='cloud-download-o' />Installation</span> } key='installation'>
                <LibraryDetailInstallationBlock { ...this.props } />
              </Tabs.TabPane>
              <Tabs.TabPane tab={ <span><Icon type='file-add' />Headers</span> } key='headers'>
                <LibraryDetailHeadersBlock data={ this.props.data } />
              </Tabs.TabPane>
              <Tabs.TabPane tab={ <span><Icon type='edit' />Manifest</span> } key='manifest'>
                <LibraryDetailManifestBlock { ...this.props } />
              </Tabs.TabPane>
              <Tabs.TabPane tab={ <span><Icon type='clock-circle-o' />Changelog</span> } key='changelog'>
                <RepositoryChangelog uri={ this.props.data.repository } />
              </Tabs.TabPane>
            </Tabs>
          </Col>
          <Col sm={ 6 }>
            <h2>Tags</h2>
            <div className='inline-buttons'>
              { this.props.data.keywords.map(name => (
                  <Button key={ name }
                    icon='tag'
                    size='small'
                    onClick={ () => this.onDidKeywordSearch(name) }>
                    { name }
                  </Button>
                )) }
            </div>
            { this.props.data.platforms.length > 0 &&
              <div className='inline-buttons'>
                <h2>Platforms</h2>
                { this.props.data.platforms.map(item => (
                    <Button key={ item.name }
                      icon='desktop'
                      size='small'
                      onClick={ () => this.onDidPlatformSearch(item.name) }>
                      { item.title }
                    </Button>
                  )) }
              </div> }
            { this.props.data.frameworks.length > 0 &&
              <div className='inline-buttons'>
                <h2>Frameworks</h2>
                { this.props.data.frameworks.map(item => (
                    <Button key={ item.name }
                      icon='setting'
                      size='small'
                      onClick={ () => this.onDidFrameworkSearch(item.name) }>
                      { item.title }
                    </Button>
                  )) }
              </div> }
            <h2>Authors</h2>
            { this.props.data.authors.map(item => (
                <div key={ item.name } className='library-author'>
                  <Icon type='book' /><a onClick={ () => this.onDidAuthorSearch(item.name) }><strong>{ item.name }</strong> <span>{ item.maintainer ? '(maintainer)' : '' }</span></a>
                  { item.email &&
                    <div>
                      <Icon type='mail' />
                      <a onClick={ () => this.props.openUrl(`mailto:${item.email}`) }>
                        { item.email }
                      </a>
                    </div> }
                  { item.url &&
                    <div>
                      <Icon type='link' />
                      <a onClick={ () => this.props.openUrl(item.url) }>
                        { item.url }
                      </a>
                    </div> }
                </div>
              )) }
            <h2>Resources</h2>
            { this.props.data.id > 0 &&
              <div>
                <Icon type='link' /> <a onClick={ () => this.props.openUrl(`http://platformio.org/lib/show/${this.props.data.id}/${this.props.data.name}`) }>Registry</a> <small><kbd>ID: { this.props.data.id }</kbd></small>
              </div> }
            { this.props.data.homepage &&
              <div>
                <Icon type='home' /> <a onClick={ () => this.props.openUrl(this.props.data.homepage) }>Homepage</a>
              </div> }
            { this.props.data.repository &&
              <div>
                <Icon type='github' /> <a onClick={ () => this.props.openUrl(this.props.data.repository) }>Repository</a>
              </div> }
            { this.props.data.__src_url &&
              <div>
                <Icon type='github' /> <a onClick={ () => this.props.openUrl(this.props.data.__src_url) }>Source</a>
              </div> }
            { this.props.data.__pkg_dir &&
              <div>
                <Icon type='folder' /> <a onClick={ () => this.props.revealFile(this.props.data.__pkg_dir) }>Location</a>
              </div> }
            { this.props.data.dlstats &&
              <div>
                <h2>Unique Downloads</h2>
                <b>{ this.props.data.dlstats.day }</b> in the last day
                <br /><b>{ this.props.data.dlstats.week }</b> in the last week
                <br /><b>{ this.props.data.dlstats.month }</b> in the last month
              </div> }
            { versions &&
              <div>
                <h2>Versions</h2>
                { versions.map(item => (
                    <div key={ item.name }>
                      <Tooltip placement='left' title={ item.released }>
                        { item.component }
                      </Tooltip>
                    </div>
                  )) }
              </div> }
          </Col>
        </Row>
      </div>
      );
  }
}
