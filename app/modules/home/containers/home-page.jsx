/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Checkbox, Col, Icon, Row } from 'antd';
import { osOpenUrl, showAtStartup } from '../../core/actions';

import PioVersions from './pio-versions';
import PlatformIOLogo from '../components/pio-logo';
import ProjectExamplesModal from '../../project/containers/examples-modal';
import ProjectImportArduinoModal from '../../project/containers/import-arduino-modal';
import ProjectNewModal from '../../project/containers/new-modal';
import ProjectOpenModal from '../../project/containers/open-modal';
import PropTypes from 'prop-types';
import React from 'react';
import RecentProjectsBlock from '../../project/containers/recent-block';
import { connect } from 'react-redux';
import { selectShowAtStartup } from '../../core/selectors';
import { selectStorageItem } from '../../../store/selectors';


class HomePage extends React.Component {

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  static propTypes = {
    caller: PropTypes.string,
    showOnStartupState: PropTypes.bool,
    osOpenUrl: PropTypes.func.isRequired,
    showAtStartup: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      newProjectVisible: false,
      importArduinoProjectVisible: false,
      openProjectVisible: false,
      projectExamplesVisible: false
    };
  }

  onDidShowOnStartup(e) {
    this.props.showAtStartup(e.target.checked);
  }

  onDidNewProject() {
    this.setState({
      newProjectVisible: true
    });
  }

  onDidCancelNewProject() {
    this.setState({
      newProjectVisible: false
    });
  }

  onDidImportArduinoProject() {
    this.setState({
      importArduinoProjectVisible: true
    });
  }

  onDidCancelImportArduinoProject() {
    this.setState({
      importArduinoProjectVisible: false
    });
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

  onDidProjectExamples() {
    this.setState({
      projectExamplesVisible: true
    });
  }

  onDidCancelProjectExamples() {
    this.setState({
      projectExamplesVisible: false
    });
  }

  render() {
    return (
      <section className='page-container'>
        <div className='home-page'>
          <h1>Welcome to <a onClick={ () => this.props.osOpenUrl('http://platformio.org') }>PlatformIO</a> <small className='pull-right' style={{ marginTop: '15px' }}>{ this.renderShowAtStartup() }</small></h1>
          <br />
          <Row className='text-center'>
            <Col span={ 12 } className='pio-logo-versions'>
              <a onClick={ () => this.props.osOpenUrl('http://platformio.org') }>
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
                <a onClick={ () => this.props.osOpenUrl('http://platformio.org') }>Web</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.osOpenUrl('https://github.com/platformio') }>Open Source</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/page/ide/pioide.html') }>Get Started</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/') }>Docs</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.osOpenUrl('https://twitter.com/PlatformIO_Org') }>News</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.osOpenUrl('https://community.platformio.org/') }>Community</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.osOpenUrl('https://github.com/platformio/platformio/issues') }>Report an Issue</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.osOpenUrl('http://platformio.org/donate') }>Donate</a>
              </li>
              <li>
                ·
              </li>
              <li>
                <a onClick={ () => this.props.osOpenUrl('http://platformio.org/contact') }>Contact</a>
              </li>
            </ul>
          </div>
          <hr className='block' />
          <RecentProjectsBlock router={ this.context.router } />
          <div className='block text-center'>
            If you enjoy using PlatformIO, please star our projects on GitHub!
            <ul className='list-inline'>
              <li>
                <Icon type='star'></Icon>
              </li>
              <li>
                <a onClick={ () => this.props.osOpenUrl('https://github.com/platformio/platformio-core') }>PlatformIO Core</a>
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
          <li>
            <ProjectNewModal visible={ this.state.newProjectVisible } onCancel={ ::this.onDidCancelNewProject } />
            <Button size='large'
              icon='plus'
              disabled={ this.state.newProjectVisible } onClick={ ::this.onDidNewProject } >
              New Project
            </Button>
          </li>
          <li>
            <ProjectImportArduinoModal visible={ this.state.importArduinoProjectVisible } onCancel={ ::this.onDidCancelImportArduinoProject } />
            <Button size='large'
              icon='folder-add'
              disabled={ this.state.importArduinoProjectVisible } onClick={ ::this.onDidImportArduinoProject } >
              Import Arduino Project
            </Button>
          </li>
          <li>
            <ProjectOpenModal visible={ this.state.openProjectVisible } onCancel={ ::this.onDidCancelOpenProject } />
            <Button size='large'
              icon='folder'
              disabled={ this.state.openProjectVisible } onClick={ ::this.onDidOpenProject } >
              Open Project
            </Button>
          </li>
          <li>
            <ProjectExamplesModal router={ this.context.router } visible={ this.state.projectExamplesVisible } onCancel={ ::this.onDidCancelProjectExamples } />
            <Button size='large'
              icon='copy'
              disabled={ this.state.projectExamplesVisible } onClick={ ::this.onDidProjectExamples } >
              Project Examples
            </Button>
          </li>
        </ul>
      </div>);
  }

  renderShowAtStartup() {
    if (!this.props.caller) {
      return null;
    }
    return (
      <div className='block text-center'>
        <Checkbox defaultChecked={ this.props.showOnStartupState } onChange={ ::this.onDidShowOnStartup }>Show at startup</Checkbox>
      </div>
    );
  }

}

// Redux

function mapStateToProps(state) {
  return {
    caller: selectStorageItem(state, 'coreCaller'),
    showOnStartupState: selectShowAtStartup(state)
  };
}


export default connect(mapStateToProps, { osOpenUrl, showAtStartup })(HomePage);
