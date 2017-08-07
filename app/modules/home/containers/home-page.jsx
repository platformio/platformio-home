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
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { openUrl } from '../../core/actions';
// import RecentProjectsBlock from '../../project/containers/recent-block';


class HomePage extends React.Component {

  static propTypes = {
    openUrl: PropTypes.func.isRequired
  }

  getQuickLinks() {
    // @TODO:
    return [
      {
        text: 'New Project',
        icon: 'plus',
      // callback: () => helpers.runAtomCommand('platformio-ide:initialize-new-project'),
      },
      {
        text: 'Import Arduino Project',
        icon: 'folder-add',
      // callback: () => helpers.runAtomCommand('platformio-ide:import-arduino-ide-project'),
      },
      {
        text: 'Open Project',
        icon: 'folder',
      // callback: () => helpers.runAtomCommand('application:add-project-folder'),
      },
      {
        text: 'Project Examples',
        icon: 'code-o',
      // callback: () => helpers.runAtomCommand('platformio-ide:project-examples'),
      }
    ];
  }

  render() {
    return (
      <section className='page-container'>
        <div className='home-page'>
          <h1>Welcome to <a onClick={ () => this.props.openUrl('http://platformio.org') }>PlatformIO</a></h1>
          <br />
          <Row className='text-center'>
            <Col span={ 24 } className='pio-logo-versions'>
              <a onClick={ () => this.props.openUrl('http://platformio.org') }>
                <PlatformIOLogo />
              </a>
              { <PioVersions /> }
            </Col>
            {/* <Col>{ this.renderQuickAccess() }</Col> */}
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
          { /*<h2>Recent Projects</h2>*/ }
          { /*<RecentProjectsBlock />*/ }
          { /*<hr />*/ }
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

  renderQuickAccess() {
    return (
      <div className='quick-links'>
        <h2>Quick Access</h2>
        <ul>
          { this.getQuickLinks().map(item => (
              <li key={ item.text }>
                <Button size='large'
                  icon={ item.icon }
                  onClick={ item.callback }
                  disabled>
                  { item.text }
                </Button>
              </li>
            )) }
        </ul>
      </div>);
  }

}

// Redux

export default connect(null, {
  openUrl
})(HomePage);
