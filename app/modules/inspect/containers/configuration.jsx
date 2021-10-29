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

import { Button, Col, Form, Icon, Row, Select, Switch } from 'antd';
import { selectInspectionError, selectSavedConfiguration } from '@inspect/selectors';

import ProjectOpenModal from '@project/containers/open-modal';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { inspectProject } from '@inspect/actions';
import { loadProjects } from '@project/actions';
import { osOpenUrl } from '@core/actions';
import { selectProjects } from '@project/selectors';
import { shallowCompare } from '@inspect/helpers';

class InspectionFormComponent extends React.Component {
  static propTypes = {
    // data
    error: PropTypes.string,
    form: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    projects: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
      })
    ),
    savedConfiguration: PropTypes.object,
    // callbacks
    inspectProject: PropTypes.func.isRequired,
    loadProjects: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired,
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    this._isMounted = true;
    const defaults = {
      memory: true,
      code: true,
    };
    this.props.loadProjects(true);
    // Storage with saved configuration loads asynchronously, so data can come later
    this.props.form.setFieldsValue(this.props.savedConfiguration || defaults);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.savedConfiguration &&
      !shallowCompare(prevProps.savedConfiguration, this.props.savedConfiguration)
    ) {
      this.props.form.setFieldsValue(this.props.savedConfiguration);
    }
    if (this.props.projects && prevProps.projects !== this.props.projects) {
      // ensure selected project still exists
      const selectedProject = this.props.form.getFieldValue('projectDir');
      if (
        selectedProject &&
        !this.props.projects.find((p) => p.path === selectedProject)
      ) {
        this.props.form.setFieldsValue({ projectDir: undefined });
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  isValid() {
    const { projectDir, env, memory, code } = this.props.form.getFieldsValue();
    return projectDir && projectDir.length && env && env.length && (memory || code);
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.isValid()) {
      return;
    }
    const { projectDir, env, memory, code } = this.props.form.getFieldsValue();
    const configuration = { projectDir, env, memory, code };
    this.setState({ running: true, error: undefined });
    this.props.inspectProject(configuration, () => {
      if (this._isMounted) {
        this.setState({ running: false });
      }
    });
  }

  handleProjectChange(projectDir) {
    const newEnvs = this._getProjectEnvs(projectDir);
    this.props.form.setFieldsValue({
      env: newEnvs.length === 1 ? newEnvs[0] : undefined,
    });
  }

  handleOpenProjectCancel(projectDir) {
    this.setState({
      openProjectVisible: false,
    });
    if (projectDir) {
      this.props.form.setFieldsValue({
        projectDir,
        env: undefined,
      });
    }
  }

  handleOpenProjectClick() {
    this.setState({
      openProjectVisible: true,
    });
  }

  handleFilterOption(input, option) {
    option.props.children.toLowerCase().includes(input.toLocaleLowerCase());
  }

  renderProjectSelect() {
    return this.props.form.getFieldDecorator('projectDir')(
      <Select
        loading={!this.props.projects}
        showSearch
        style={{ width: '100%' }}
        size="large"
        placeholder={this.props.projects ? 'Select a project' : 'Loading…'}
        optionFilterProp="children"
        filterOption={::this.handleFilterOption}
        onChange={::this.handleProjectChange}
      >
        {(this.props.projects || [])
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ name, path }) => (
            <Select.Option key={path} value={path}>
              {name}
            </Select.Option>
          ))}
      </Select>
    );
  }

  _getProjectByPath(projectDir) {
    return (this.props.projects || []).find((x) => x.path === projectDir);
  }

  _getProjectEnvs(projectDir) {
    const project = this._getProjectByPath(projectDir);
    return ((project && project.envs) || []).sort((a, b) => a.localeCompare(b));
  }

  renderEnvSelect() {
    const projectDir = this.props.form.getFieldValue('projectDir');
    const items = this._getProjectEnvs(projectDir);

    return this.props.form.getFieldDecorator('env')(
      <Select
        loading={!this.props.projects}
        disabled={!projectDir}
        style={{ width: '100%' }}
        size="large"
        placeholder={projectDir && items ? 'Select environment' : ''}
      >
        {items.map((name) => (
          <Select.Option key={name} value={name}>
            {name}
          </Select.Option>
        ))}
      </Select>
    );
  }

  render() {
    return (
      <div className="inspect-configuration-page">
        <ProjectOpenModal
          skipOpenProject
          visible={this.state.openProjectVisible}
          onCancel={::this.handleOpenProjectCancel}
        />

        <h1 style={{ marginTop: 12 }}>Project Inspection</h1>
        <p>
          A report after inspection includes memory use information with a detailed
          visual view of memory utilization, helps locate and improve parts of the
          application like symbols or functions which have a significant memory
          footprint. A static code analysis report helps spot and fix software defects
          before debugging.
        </p>
        <p>
          <Icon type="bulb" /> Building a project in{' '}
          <a
            onClick={() =>
              this.props.osOpenUrl(
                'http://docs.platformio.org/page/projectconf/build_configurations.html'
              )
            }
          >
            debug mode
          </a>{' '}
          before an inspection can significantly reduce the processing time.
        </p>

        <Form layout="vertical" onSubmit={::this.handleSubmit}>
          <Form.Item label="Project">
            <Row gutter={8}>
              <Col xs={24} sm={17} md={19} lg={20}>
                {this.renderProjectSelect()}
              </Col>
              <Col xs={24} sm={7} md={5} lg={4}>
                <Button
                  icon="folder"
                  size="large"
                  style={{ width: '100%' }}
                  onClick={::this.handleOpenProjectClick}
                >
                  Browse
                </Button>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item label="Environment">{this.renderEnvSelect()}</Form.Item>

          <Form.Item>
            <label className="switch-label">
              {this.props.form.getFieldDecorator('memory', {
                valuePropName: 'checked',
                initialValue: true,
              })(<Switch />)}{' '}
              Inspect Memory
            </label>
            <label className="switch-label">
              {this.props.form.getFieldDecorator('code', {
                valuePropName: 'checked',
                initialValue: true,
              })(<Switch />)}{' '}
              Check Code
            </label>
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              disabled={!this.isValid()}
              loading={this.state.running}
              size="large"
              icon="caret-right"
              type="primary"
            >
              Inspect
            </Button>
          </Form.Item>
        </Form>
        {this.props.error && (
          <div>
            <div className="ant-form-item-label">
              <label>Errors</label>
            </div>
            <div className="inspect-config-console">
              {this.props.error.replace(/\\\\n/g, '\n')}
            </div>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    error: selectInspectionError(state),
    projects: selectProjects(state),
    savedConfiguration: selectSavedConfiguration(state),
  };
}

const dispatchToProps = {
  inspectProject,
  loadProjects,
  osOpenUrl,
};

const ConnectedInspectionForm = connect(
  mapStateToProps,
  dispatchToProps
)(InspectionFormComponent);

export const InspectionForm = Form.create()(ConnectedInspectionForm);
