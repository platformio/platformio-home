/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Alert, Button, Col, Icon, Row, Select, Tabs, Tooltip } from 'antd';

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
      homepage: PropTypes.string.isRequired,
      repository: PropTypes.string,
      url: PropTypes.string,
      license: PropTypes.string,
      version: PropTypes.string,
      versions: PropTypes.arrayOf(PropTypes.string),
      frameworks: PropTypes.arrayOf(PropTypes.object),
      packages: PropTypes.arrayOf(PropTypes.object),
      boards: PropTypes.arrayOf(PropTypes.object),
      __src_url: PropTypes.string,
      __pkg_dir: PropTypes.string
    }),
    revealFile: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    showInstalledPlatforms: PropTypes.func.isRequired,
    installPlatform: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      installing: false,
      versionForInstall: null
    };
  }

  onDidReveal(dir) {
    this.props.revealFile(dir);
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
      this.state.versionForInstall ? `${this.props.data.name}@${this.state.versionForInstall}` : this.props.data.name,
      () => this.setState({
        installing: false
      }));
  }

  renderQuickInstallation(versions) {
    return (
      <div>
        <h3>Installation</h3>
        <ul className='block list-inline'>
          <li>
            <Select defaultValue={ versions[0] } onChange={ ::this.onDidVersionChange }>
              { versions.map(name => (
                  <Select.Option key={ name } value={ name }>
                    { name }
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
        </ul>
      </div>
      );
  }

  render() {
    let extra;
    if (this.props.data.version) {
      extra = <small className='pull-right' style={ { marginTop: '15px' } }><Tooltip title='Version'> <Icon type={ this.props.data.__src_url ? 'fork' : 'environment-o' } /> { this.props.data.version } </Tooltip></small>;
    }
    return (
      <div>
        <h1>{ this.props.data.title } { extra }</h1>
        <div className='lead'>
          { this.props.data.description }
        </div>
        { this.props.data.versions && this.renderQuickInstallation(this.props.data.versions.slice(0).reverse()) }
        <Row>
          <Col sm={ 20 } className='tabs-block'>
            <Tabs type='card'>
              <Tabs.TabPane tab={ <span><Icon type='calculator' />Boards</span> } key='boards'>
                <Boards items={ this.props.data.boards }
                  noHeader
                  excludeColumns={ ['Platform'] }
                  showPlatform={ this.props.showPlatform }
                  showFramework={ this.props.showFramework }
                  openUrl={ this.props.openUrl } />
              </Tabs.TabPane>
              <Tabs.TabPane tab={ <span><Icon type='copy' />Examples</span> } key='examples'>
                { this.props.data.__pkg_dir ? (
                  <PlatformProjectExamples pkgDir={ this.props.data.__pkg_dir } />
                  ) : (
                  <Alert type='error' showIcon message={ <span>Examples availalbe only for <a onClick={ () => this.props.showInstalledPlatforms() }>installed platforms</a>.</span> } />
                  ) }
              </Tabs.TabPane>
              <Tabs.TabPane tab={ <span><Icon type='appstore-o' />Packages</span> } key='packages'>
                <PlatformDetailPackages items={ this.props.data.packages } openUrl={ this.props.openUrl } showInstalledPlatforms={ this.props.showInstalledPlatforms } />
              </Tabs.TabPane>
              <Tabs.TabPane tab={ <span><Icon type='clock-circle-o' />Changelog</span> } key='changelog'>
                <RepositoryChangelog uri={ this.props.data.repository } />
              </Tabs.TabPane>
            </Tabs>
          </Col>
          <Col sm={ 4 }>
            <h2>Frameworks</h2>
            <ul className='resources-list'>
              { this.props.data.frameworks.map(item => (
                  <li key={ item.name }>
                    <Button icon='setting' size='small' onClick={ () => this.props.showFramework(item.name) }>
                      { item.title }
                    </Button>
                  </li>
                )) }
            </ul>
            <h2>Resources</h2>
            <ul className='resources-list'>
              <li>
                <kbd>platform = { this.props.data.name }</kbd>
              </li>
              <li>
                <Icon type='home' /> <a onClick={ () => this.props.openUrl(this.props.data.homepage) }>Homepage</a>
              </li>
              { this.props.data.repository &&
                <li>
                  <Icon type='github' /> <a onClick={ () => this.props.openUrl(this.props.data.repository) }>Repository</a>
                </li> }
              <li>
                <Icon type='info-circle-o' /> <a onClick={ () => this.props.openUrl(`http://docs.platformio.org/page/platforms/${this.props.data.name}.html`) }>Documentation</a>
              </li>
              <li>
                <Icon type='link' /> <a onClick={ () => this.props.openUrl(this.props.data.url) }>Vendor</a>
              </li>
              { this.props.data.license &&
                <li>
                  <Icon type='copyright' />
                  <a onClick={ () => this.props.openUrl(`https://opensource.org/licenses/${this.props.data.license}`) }>
                    { ' ' + this.props.data.license }
                  </a>
                </li> }
              { this.props.data.__src_url &&
                <li>
                  <Icon type='github' /> <a onClick={ () => this.props.openUrl(this.props.data.__src_url) }>Source</a>
                </li> }
              { this.props.data.__pkg_dir &&
                <li>
                  <Icon type='folder' /> <a onClick={ () => this.props.revealFile(this.props.data.__pkg_dir) }>Location</a>
                </li> }
              { this.props.data.versions &&
                <li>
                  <h2>Versions</h2>
                  <ul>
                    { this.props.data.versions.slice(0).reverse().map(name => (
                        <li key={ name }>
                          <Icon type='environment-o' />
                          { name }
                        </li>
                      )) }
                  </ul>
                </li> }
            </ul>
          </Col>
        </Row>
      </div>
      );
  }
}
