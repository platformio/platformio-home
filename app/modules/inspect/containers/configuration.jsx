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

import { Button, Col, Form, Row, Select, Switch } from 'antd';
import { inspectProject, loadProjectEnvironments } from '@inspect/actions';
import {
  selectProjectEnvironments,
  selectSavedConfiguration
} from '@inspect/selectors';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { generateProjectNameFromPath } from '@inspect/helpers';
import { loadProjects } from '@project/actions';
import { selectProjects } from '@project/selectors';

class InspectionFormComponent extends React.Component {
  static propTypes = {
    envs: PropTypes.arrayOf(PropTypes.string.isRequired),
    form: PropTypes.object,
    inspectProject: PropTypes.func.isRequired,
    loadProjects: PropTypes.func.isRequired,
    loadProjectEnvironments: PropTypes.func.isRequired,
    projects: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired
      })
    ),
    savedConfiguration: PropTypes.object
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    this._isMounted = true;
    const defaults = {
      memory: true,
      code: true
    };
    this.props.loadProjects();
    this.props.form.setFieldsValue(this.props.savedConfiguration || defaults);
  }

  componentDidUpdate(prevProps) {
    // Preselect single option when new envs have been loaded
    if (
      this.props.envs !== prevProps.envs &&
      this.props.envs &&
      this.props.envs.length === 1
    ) {
      const env = this.props.envs[0];
      this.props.form.setFieldsValue({
        env
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  isValid() {
    const { projectDir, env, memory, code } = this.props.form.getFieldsValue();
    return projectDir && projectDir.length && env && env.length && (memory || code);
  }

  handleSubmit = e => {
    e.preventDefault();
    if (!this.isValid()) {
      return;
    }
    const { projectDir, env, memory, code } = this.props.form.getFieldsValue();
    const configuration = { projectDir, env, memory, code };
    this.setState({ running: true, error: undefined });
    this.props.inspectProject(configuration, (_result, error) => {
      if (this._isMounted) {
        this.setState({ running: false, error });
      }
    });
  };

  handleProjectChange = projectDir => {
    this.props.form.setFieldsValue({
      env: undefined
    });
    this.props.loadProjectEnvironments(projectDir);
  };

  handleFilterOption = (input, option) =>
    option.props.children.toLowerCase().includes(input.toLocaleLowerCase());

  renderProjectSelect() {
    const value = this.props.form.getFieldValue('projectDir');
    return (
      <div>
        {this.props.form.getFieldDecorator('projectDir')(
          <Select
            loading={!this.props.projects}
            showSearch
            style={{ width: '100%' }}
            size="large"
            placeholder={this.props.projects ? 'Select a project' : 'Loading…'}
            optionFilterProp="children"
            filterOption={this.handleFilterOption}
            onChange={this.handleProjectChange}
          >
            {this.props.projects &&
              this.props.projects
                .map(x => ({
                  ...x,
                  name: generateProjectNameFromPath(x.path)
                }))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(({ name, path }) => (
                  <Select.Option key={path} value={path}>
                    {name}
                  </Select.Option>
                ))}
          </Select>
        )}
        {value && (
          <small style={{ display: 'block', lineHeight: 1, marginTop: 5 }}>
            {value}
          </small>
        )}
      </div>
    );
  }

  renderEnvSelect() {
    const projectDir = this.props.form.getFieldValue('projectDir');
    return this.props.form.getFieldDecorator('env')(
      <Select
        loading={projectDir && !this.props.envs}
        disabled={!projectDir}
        style={{ width: '100%' }}
        size="large"
        placeholder={this.props.envs ? 'Select environment' : ''}
        optionFilterProp="children"
        filterOption={this.handleFilterOption}
      >
        {this.props.envs &&
          this.props.envs
            .sort((a, b) => a.localeCompare(b))
            .map(name => (
              <Select.Option key={name} value={name}>
                {name}
              </Select.Option>
            ))}
      </Select>
    );
  }

  render() {
    const labelSpan = 3;
    const wrapperSpan = 13;
    const itemLayout = {
      labelCol: { span: labelSpan },
      wrapperCol: { span: wrapperSpan }
    };
    const buttonsLayout = {
      wrapperCol: { span: wrapperSpan, offset: labelSpan }
    };
    return (
      <div>
        <Row>
          <Col offset={labelSpan}>
            <h1 style={{ marginTop: 12 }}>Inspection Configuration</h1>
            <p style={{ maxWidth: '40em' }}>
              This wizard allows you to create new PlatformIO project or update
              existing. In the last case, you need to uncheck &quote;Use default
              location&quote; and specify path to existing project.
            </p>
          </Col>
        </Row>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <Form.Item label="Project" {...itemLayout}>
            {this.renderProjectSelect()}
          </Form.Item>

          <Form.Item label="Environment" {...itemLayout}>
            {this.renderEnvSelect()}
          </Form.Item>

          <Form.Item wrapperCol={{ span: 14, offset: labelSpan }}>
            <span className="ant-form-item-label" style={{ marginRight: 15 }}>
              <label>Inspect Memory</label>
              {this.props.form.getFieldDecorator('memory', {
                valuePropName: 'checked',
                initialValue: true
              })(<Switch />)}
            </span>
            <span className="ant-form-item-label">
              <label>Check Code</label>
              {this.props.form.getFieldDecorator('code', {
                valuePropName: 'checked',
                initialValue: true
              })(<Switch />)}
            </span>
          </Form.Item>

          <Form.Item {...buttonsLayout}>
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
        {this.state.error && <textarea readOnly value={this.state.error} />}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    envs: selectProjectEnvironments(state, ownProps.form.getFieldValue('projectDir')),
    projects: selectProjects(state),
    savedConfiguration: selectSavedConfiguration(state)
  };
}

const dispatchProps = {
  inspectProject,
  loadProjects,
  loadProjectEnvironments
};

const ConnectedInspectionForm = connect(
  mapStateToProps,
  dispatchProps
)(InspectionFormComponent);

export const InspectionForm = Form.create()(ConnectedInspectionForm);
