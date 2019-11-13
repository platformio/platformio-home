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
import * as path from '../../core/path';

import { Checkbox, Form, Icon, Input, Modal, Select, Tooltip } from 'antd';

import BoardSelect from '../../platform/containers/board-select';
import FileExplorer from '../../core/containers/file-explorer';
import ProjectInitCarousel from '../components/init-carousel';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { osOpenUrl } from '../../core/actions';
import { selectStorageItem } from '../../../store/selectors';

class ProjectNewModal extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,

    projectsDir: PropTypes.string,

    addProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    initProject: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      selectedFramework: null,
      useDefaultLocation: true,
      frameworks: [],
      projectLocation: null,
      inProgress: false
    };
  }

  onDidBoard(board) {
    const frameworks = board.frameworks || [];
    this.setState({
      selectedFramework: frameworks.length ? frameworks[0].name : null,
      frameworks
    });
  }

  onDidFramework(framework) {
    this.setState({
      selectedFramework: framework
    });
  }

  onDidUseDefaultLocation(e) {
    this.setState({
      useDefaultLocation: e.target.checked
    });
  }

  onDidProjectLocation(projectLocation) {
    this.props.form.resetFields(['isCustomLocation']);
    this.setState({
      projectLocation
    });
  }

  onDidFinish() {
    this.props.form.resetFields(['isCustomLocation']);
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({
        inProgress: true
      });
      this.props.initProject(
        values.board.id,
        this.state.selectedFramework,
        path.join(
          this.state.useDefaultLocation
            ? this.props.projectsDir
            : this.state.projectLocation,
          values.name
        ),
        (err, location) => {
          this.setState({
            inProgress: false
          });
          if (!err) {
            this.props.addProject(location);
            this.props.openProject(location);
            this.onDidCancel(location);
          }
        }
      );
    });
  }

  onDidCancel(projectDir) {
    this.setState({
      inProgress: false
    });
    this.props.onCancel(projectDir);
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        confirmLoading={this.state.inProgress}
        width={600}
        title="Project Wizard"
        okText={this.state.inProgress ? 'Please wait...' : 'Finish'}
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
    const { getFieldDecorator } = this.props.form;
    return (
      <Form hideRequiredMark>
        <div className="block">
          This wizard allows you to <b>create new</b> PlatformIO project or{' '}
          <b>update existing</b>. In the last case, you need to uncheck &quot;Use
          default location&quot; and specify path to existing project.
        </div>
        <Form.Item label="Name" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                whitespace: true,
                pattern: /^[a-z\d\_\-\. ]+$/i,
                message: 'Please input a valid name for project folder! [a-z0-9_-. ]'
              }
            ]
          })(<Input placeholder="Project name" />)}
        </Form.Item>
        <Form.Item label="Board" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {getFieldDecorator('board', {
            rules: [
              {
                required: true,
                message: 'Please select a board!'
              }
            ]
          })(<BoardSelect onChange={::this.onDidBoard} />)}
        </Form.Item>
        <Form.Item label="Framework" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          <Select
            value={this.state.selectedFramework}
            style={{ width: '100%' }}
            size="large"
            disabled={!this.state.selectedFramework}
            onChange={::this.onDidFramework}
          >
            {this.state.frameworks.map(item => (
              <Select.Option key={item.name} value={item.name} title={item.title}>
                {item.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Location" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
          {getFieldDecorator('isCustomLocation', {
            rules: [
              {
                validator: (rule, value, callback) =>
                  setTimeout(
                    () =>
                      callback(
                        this.state.useDefaultLocation || this.state.projectLocation
                          ? undefined
                          : true
                      ),
                    200
                  ),
                message: 'Please select a custom project location!'
              }
            ]
          })(
            <Checkbox
              onChange={::this.onDidUseDefaultLocation}
              checked={this.state.useDefaultLocation}
            >
              Use default location
              <Tooltip
                title={`Default location for PlatformIO Projects is: "${this.props.projectsDir}"`}
                overlayStyle={{ wordBreak: 'break-all' }}
              >
                <Icon type="question-circle" style={{ marginLeft: '5px' }} />
              </Tooltip>
            </Checkbox>
          )}
        </Form.Item>
        {!this.state.useDefaultLocation && this.renderExplorer()}
      </Form>
    );
  }

  renderExplorer() {
    return (
      <div>
        <div style={{ marginBottom: '5px' }}>
          Choose a location where we will create project folder:
        </div>
        <FileExplorer ask="directory" onSelect={::this.onDidProjectLocation} />
      </div>
    );
  }
}

// Redux

function mapStateToProps(state) {
  return {
    projectsDir: selectStorageItem(state, 'projectsDir')
  };
}

export default connect(mapStateToProps, {
  ...actions,
  osOpenUrl
})(Form.create()(ProjectNewModal));
