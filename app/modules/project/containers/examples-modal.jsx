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

import * as actions from '../actions';
import * as workspaceSettings from '../../../workspace/settings';

import { Button, Icon, Modal, Select, Spin, message } from 'antd';

import ProjectInitCarousel from '../components/init-carousel';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { osOpenUrl } from '../../core/actions';
import { selectProjectExamples } from '../selectors';

class ProjectExamplesModal extends React.Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,

    items: PropTypes.array,

    loadProjectExamples: PropTypes.func.isRequired,
    addProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    importProject: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired,
    showInstalledPlatforms: PropTypes.func.isRequired,
    showEmbeddedPlatforms: PropTypes.func.isRequired,
    showDesktopPlatforms: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      examplePath: null,
      inProgress: false
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.visible || prevProps.items) {
      return;
    }
    this.props.loadProjectExamples();
  }

  onDidExample(examplePath) {
    this.setState({
      examplePath
    });
  }

  onDidFinish() {
    if (!this.state.examplePath) {
      return message.error('Please select an example');
    }
    this.setState({
      inProgress: true
    });
    this.props.importProject(this.state.examplePath, (err, location) => {
      this.setState({
        inProgress: false
      });
      if (!err) {
        this.props.addProject(location);
        this.props.openProject(location);
        this.onDidCancel();
      }
    });
  }

  onDidCancel() {
    this.setState({
      inProgress: false
    });
    this.props.onCancel();
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        className="project-examples-modal"
        confirmLoading={this.state.inProgress}
        width={600}
        title="Import Project Example"
        okText={this.state.inProgress ? 'Please wait...' : 'Import'}
        onOk={::this.onDidFinish}
        onCancel={::this.onDidCancel}
      >
        {this.renderBody()}
      </Modal>
    );
  }

  renderBody() {
    if (this.state.inProgress) {
      return <ProjectInitCarousel osOpenUrl={this.props.osOpenUrl} />;
    }

    if (!this.props.items) {
      return (
        <div className="text-center">
          <Spin tip="Loading..." size="large" />
        </div>
      );
    }
    if (this.props.items.length === 0) {
      return this.renderNoExamples();
    }
    const knownPlatforms = [];
    const duplicatedPlatforms = [];
    this.props.items.forEach(item => {
      if (knownPlatforms.includes(item.platform.title)) {
        duplicatedPlatforms.push(item.platform.title);
        return;
      }
      knownPlatforms.push(item.platform.title);
    });
    return (
      <div>
        {!workspaceSettings.get('singleDevPlatform') && (
          <div className="block">
            <p>
              We use examples provided by{' '}
              <a onClick={() => this.props.showInstalledPlatforms()}>
                installed development platforms
              </a>
              . Please install more platforms to see the new examples.
            </p>
            Examples already contain pre-configured build environemnts (boards, flags,
            etc.). You can edit them later in{' '}
            <a
              onClick={() =>
                this.props.osOpenUrl('http://docs.platformio.org/page/projectconf.html')
              }
            >
              Project Configuration File &quot;platformio.ini&quot;
            </a>{' '}
            located in a root of project.
          </div>
        )}
        <Select
          showSearch
          style={{ width: '100%' }}
          size="large"
          placeholder="Select an example..."
          filterOption={(input, option) =>
            option.key.toLowerCase().includes(input.toLowerCase())
          }
          onChange={::this.onDidExample}
        >
          {this.props.items
            .filter(item =>
              workspaceSettings.get('filterProjectExample', () => true)(item)
            )
            .map(data => (
              <Select.OptGroup
                key={`${data.platform.title}-${data.platform.version}`}
                label={
                  <span>
                    <Icon type="appstore" /> {data.platform.title}{' '}
                    {duplicatedPlatforms.includes(data.platform.title)
                      ? `[#${data.platform.version}]`
                      : ''}
                  </span>
                }
              >
                {data.items.map(item => (
                  <Select.Option
                    key={`${data.platform.title}-${data.platform.version}-${item.name}-${item.description}`}
                    value={item.path}
                  >
                    {item.name}
                    {item.description && (
                      <div className="select-option-extra project-example-description">
                        {item.description}
                      </div>
                    )}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ))}
        </Select>
      </div>
    );
  }

  renderNoExamples() {
    return (
      <div className="text-center">
        <ul className="block background-message text-center">
          <li>No Examples</li>
        </ul>
        <br />
        <div className="block">
          We use examples from installed development platforms. Please install the one
          of them.
        </div>
        <ul className="list-inline">
          <li>
            <Button
              icon="download"
              type="primary"
              onClick={() => this.props.showEmbeddedPlatforms()}
            >
              Install Embedded Platform
            </Button>
          </li>
          <li>or</li>
          <li>
            <Button
              icon="download"
              type="primary"
              onClick={() => this.props.showDesktopPlatforms()}
            >
              Install Desktop Platform
            </Button>
          </li>
        </ul>
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectProjectExamples(state),
    showInstalledPlatforms: () => goTo(ownProps.router.history, '/platforms/installed'),
    showEmbeddedPlatforms: () => goTo(ownProps.router.history, '/platforms/embedded'),
    showDesktopPlatforms: () => goTo(ownProps.router.history, '/platforms/desktop')
  };
}

export default connect(mapStateToProps, {
  ...actions,
  osOpenUrl
})(ProjectExamplesModal);
