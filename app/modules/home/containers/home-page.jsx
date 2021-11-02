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

import { Button, Checkbox, Col, Row } from 'antd';
import { osOpenUrl, showAtStartup } from '../../core/actions';

import CompanyLogo from '../components/company-logo';
import PioVersions from './pio-versions';
import ProjectExamplesModal from '../../project/containers/examples-modal';
import ProjectImportArduinoModal from '../../project/containers/import-arduino-modal';
import ProjectNewModal from '../../project/containers/new-modal';
import ProjectOpenModal from '../../project/containers/open-modal';
import PropTypes from 'prop-types';
import React from 'react';
import RecentNews from './recent-news';
import RecentProjectsBlock from '../../project/containers/recent-block';
import { connect } from 'react-redux';
import { selectShowAtStartup } from '../../core/selectors';
import { selectStorageItem } from '../../../store/selectors';

class HomePage extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    caller: PropTypes.string,
    showOnStartupState: PropTypes.bool,
    osOpenUrl: PropTypes.func.isRequired,
    showAtStartup: PropTypes.func.isRequired,
  };

  constructor() {
    super(...arguments);
    this.state = {
      newProjectVisible: false,
      importArduinoProjectVisible: false,
      openProjectVisible: false,
      projectExamplesVisible: false,
    };
  }

  onDidShowOnStartup(e) {
    this.props.showAtStartup(e.target.checked);
  }

  onDidNewProject() {
    this.setState({
      newProjectVisible: true,
    });
  }

  onDidCancelNewProject() {
    this.setState({
      newProjectVisible: false,
    });
  }

  onDidImportArduinoProject() {
    this.setState({
      importArduinoProjectVisible: true,
    });
  }

  onDidCancelImportArduinoProject() {
    this.setState({
      importArduinoProjectVisible: false,
    });
  }

  onDidOpenProject() {
    this.setState({
      openProjectVisible: true,
    });
  }

  onDidCancelOpenProject() {
    this.setState({
      openProjectVisible: false,
    });
  }

  onDidProjectExamples() {
    this.setState({
      projectExamplesVisible: true,
    });
  }

  onDidCancelProjectExamples() {
    this.setState({
      projectExamplesVisible: false,
    });
  }

  render() {
    return (
      <section className="page-container">
        <div className="home-page">
          <h1>
            Welcome to{' '}
            <a
              onClick={() =>
                this.props.osOpenUrl(
                  workspaceSettings.getUrl('welcome', workspaceSettings.getUrl('home'))
                )
              }
            >
              {workspaceSettings.get('title')}
            </a>{' '}
            <small className="pull-right" style={{ marginTop: '15px' }}>
              {this.renderShowAtStartup()}
            </small>
          </h1>
          <Row className="text-center">
            <Col span={12} className="company-logo-versions">
              <a onClick={() => this.props.osOpenUrl(workspaceSettings.getUrl('home'))}>
                <CompanyLogo height={workspaceSettings.get('companyLogoHomeHeight')} />
              </a>
              {workspaceSettings.get('showPIOVersions', false) && <PioVersions />}
            </Col>
            <Col span={12}>{this.renderQuickAccess()}</Col>
          </Row>
          <RecentNews />
          <RecentProjectsBlock
            router={this.context.router}
            showProjectExamplesModal={::this.onDidProjectExamples}
            showOpenProjectModal={::this.onDidOpenProject}
          />
        </div>
      </section>
    );
  }

  renderQuickAccess() {
    return (
      <div className="quick-buttons">
        <h2>Quick Access</h2>
        <ul>
          {!workspaceSettings
            .get('ignoreQuickAccessButtons', [])
            .includes('new-project') && (
            <li>
              <ProjectNewModal
                visible={this.state.newProjectVisible}
                onCancel={::this.onDidCancelNewProject}
              />
              <Button
                size="large"
                icon="plus"
                disabled={this.state.newProjectVisible}
                onClick={::this.onDidNewProject}
              >
                New Project
              </Button>
            </li>
          )}
          {!workspaceSettings
            .get('ignoreQuickAccessButtons', [])
            .includes('import-arduino-project') && (
            <li>
              <ProjectImportArduinoModal
                visible={this.state.importArduinoProjectVisible}
                onCancel={::this.onDidCancelImportArduinoProject}
              />
              <Button
                size="large"
                icon="folder-add"
                disabled={this.state.importArduinoProjectVisible}
                onClick={::this.onDidImportArduinoProject}
              >
                Import Arduino Project
              </Button>
            </li>
          )}
          <li>
            <ProjectOpenModal
              visible={this.state.openProjectVisible}
              onCancel={::this.onDidCancelOpenProject}
            />
            <Button
              size="large"
              icon="folder"
              disabled={this.state.openProjectVisible}
              onClick={::this.onDidOpenProject}
            >
              Open Project
            </Button>
          </li>
          <li>
            <ProjectExamplesModal
              router={this.context.router}
              visible={this.state.projectExamplesVisible}
              onCancel={::this.onDidCancelProjectExamples}
            />
            <Button
              size="large"
              icon="copy"
              disabled={this.state.projectExamplesVisible}
              onClick={::this.onDidProjectExamples}
            >
              {workspaceSettings.getMessage('homeQuickButtonProjectExamples')}
            </Button>
          </li>
        </ul>
      </div>
    );
  }

  renderShowAtStartup() {
    if (!this.props.caller) {
      return null;
    }
    return (
      <div className="block text-center">
        <Checkbox
          defaultChecked={this.props.showOnStartupState}
          onChange={::this.onDidShowOnStartup}
        >
          Show at startup
        </Checkbox>
      </div>
    );
  }
}

// Redux

function mapStateToProps(state) {
  return {
    caller: selectStorageItem(state, 'coreCaller'),
    showOnStartupState: selectShowAtStartup(state),
  };
}

export default connect(mapStateToProps, {
  osOpenUrl,
  showAtStartup,
})(HomePage);
