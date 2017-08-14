/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Col, Icon, Row } from 'antd';

import PioVersions from './pio-versions';
import PlatformIOLogo from '../components/pio-logo';
import ProjectOpenModal from '../../project/containers/open-modal';
import PropTypes from 'prop-types';
import React from 'react';
import RecentProjectsBlock from '../../project/containers/recent-block';
import { connect } from 'react-redux';
import { openUrl } from '../../core/actions';


class HomePage extends React.Component {

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  static propTypes = {
    openUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      openProjectVisible: false
    };
  }

  onDidOpenProject() {
    this.setState({
      openProjectVisible: true
    });
  }

  onDidCancelOpenProject() {
    this.setState({
      openProjectVisible: false
    });
  }

  render() {
    return (
      <section className='page-container'>
        <ProjectOpenModal visible={ this.state.openProjectVisible } onCancel={ ::this.onDidCancelOpenProject } />
        <div className='home-page'>
          <h1>Welcome to <a onClick={ () => this.props.openUrl('http://platformio.org') }>PlatformIO</a></h1>
          <br />
          <Row className='text-center'>
            <Col span={ 12 } className='pio-logo-versions'>
              <a onClick={ () => this.props.openUrl('http://platformio.org') }>
                <PlatformIOLogo />
              </a>
              { <PioVersions /> }
            </Col>
            <Col span={ 12 }>{ this.renderQuickAccess() }</Col>
          </Row>
          <br />
          <div className='block text-center'>
            <ul className='list-inline'>
              <li>
                <a onClick={ () => this.props.openUrl('http://platformio.org') }>Web</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.openUrl('https://pioplus.com') }>Plus</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.openUrl('https://github.com/platformio') }>Open Source</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/ide/atom.html#quick-start') }>Get Started</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.openUrl('http://docs.platformio.org/') }>Docs</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.openUrl('https://community.platformio.org/') }>Community</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.openUrl('https://github.com/platformio/platformio/issues') }>Report an Issue</a>
              </li>
            </ul>
            <hr />
          </div>
          <h2>Recent Projects</h2>
          <RecentProjectsBlock router={ this.context.router } />
          <br />
          <div className='block text-center'>
            If you enjoy using PlatformIO, please star our projects on GitHub!
            <ul className='list-inline'>
              <li>
                <Icon type='star'></Icon>
              </li>
              <li>
                <a onClick={ () => this.props.openUrl('https://github.com/platformio/platformio-core') }>PlatformIO Core</a>
              </li>
              <li>
                <Icon type='star'></Icon>
              </li>
            </ul>
          </div>
        </div>
      </section>
      );
  }

  // getQuickLinks() {
  //   // @TODO:
  //   return [
  //     {
  //       text: 'New Project',
  //       icon: 'plus',
  //     // callback: () => helpers.runAtomCommand('platformio-ide:initialize-new-project'),
  //     },
  //     {
  //       text: 'Import Arduino Project',
  //       icon: 'folder-add',
  //     // callback: () => helpers.runAtomCommand('platformio-ide:import-arduino-ide-project'),
  //     },
  //     {
  //       text: 'Open Project',
  //       icon: 'folder',
  //       callback: () => helpers.runAtomCommand('application:add-project-folder'),
  //     },
  //     {
  //       text: 'Project Examples',
  //       icon: 'code-o',
  //     // callback: () => helpers.runAtomCommand('platformio-ide:project-examples'),
  //     }
  //   ];
  // }

  renderQuickAccess() {
    return (
      <div className='quick-links'>
        <h2>Quick Access</h2>
        <ul>
          <li>
            <Button size='large'
              icon='folder'
              loading={ this.state.advancedOpened } disabled={ this.state.openProjectVisible } onClick={ ::this.onDidOpenProject } >
              Open Project
            </Button>
          </li>
        </ul>
      </div>);
  }

}

// Redux

export default connect(null, { openUrl })(HomePage);
