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

import { Button, Col, Form, Row, Switch } from 'antd';
import { inspectProject, saveInspectForm } from '@inspect/actions';

import { ProjectEnvSelect } from '@inspect/containers/project-env-select';
import { ProjectSelect } from '@project/containers/project-select';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { generateInspectionResultKey } from '../helpers';
import { goTo } from '@core/helpers';
import { selectFormState } from '@inspect/selectors';

class InspectionFormComponent extends React.Component {
  static propTypes = {
    envs: PropTypes.arrayOf(PropTypes.string.isRequired),
    // Antd generated Form
    form: PropTypes.object,
    // Saved Redux form state
    formState: PropTypes.object,
    history: PropTypes.object.isRequired,
    entities: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onInspect: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = { submitted: false };
  }

  componentDidUpdate() {
    const { history } = this.props;
    const { submitted } = this.state;
    const redirectPath = '/inspect/result';
    if (
      submitted &&
      this.getStatus() === 'ready' &&
      history.location.pathname !== redirectPath
    ) {
      this.setState({ submitted: false });
      goTo(history, redirectPath);
    }
  }

  getStatus() {
    const { project, env, memory, code } = this.props.form.getFieldsValue();
    if (!project || !env) {
      return '';
    }
    const key = generateInspectionResultKey(project, env, memory, code);
    const entity = this.props.entities[key] || {};
    return (entity.meta || {}).status || '';
  }

  handleSubmit = e => {
    const { form } = this.props;

    e.preventDefault();
    form.validateFields((err, values) => {
      const { project, env, memory, code } = values;
      if (!(memory || code)) {
        const error = new Error('Please check memory or code');
        form.setFields({
          memory: {
            errors: [error]
          },
          code: {
            errors: [error]
          }
        });
        return;
      }
      if (err) {
        return;
      }
      this.setState({ submitted: true });
      this.props.onInspect(project, env, { memory, code }, true);
    });
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

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
            {getFieldDecorator('project', {
              rules: [
                {
                  required: true,
                  message: 'Please select project'
                }
              ]
            })(<ProjectSelect onChange={this.handleProjectChange} />)}
          </Form.Item>

          <Form.Item label="Environment" {...itemLayout}>
            {getFieldDecorator('env', {
              rules: [
                {
                  required: true,
                  message: 'Please select environment'
                }
              ]
            })(
              <ProjectEnvSelect
                project={getFieldValue('project')}
                onChange={this.handleEnvChange}
              />
            )}
          </Form.Item>

          <Form.Item {...buttonsLayout}>
            <Button type="link">Advanced Settings…</Button>
          </Form.Item>
          <div style={{ display: 'block' }}>
            <Form.Item wrapperCol={{ span: 14, offset: labelSpan }}>
              <span className="ant-form-item-label" style={{ marginRight: 15 }}>
                <label>Memory</label>
                {getFieldDecorator('memory', {
                  valuePropName: 'checked',
                  initialValue: true
                })(<Switch onChange={this.handleMemorySwitch} />)}
              </span>
              <span className="ant-form-item-label">
                <label>Code</label>
                {getFieldDecorator('code', {
                  valuePropName: 'checked',
                  initialValue: true
                })(<Switch onChange={this.handleCodeSwitch} />)}
              </span>
            </Form.Item>
          </div>

          <Form.Item {...buttonsLayout}>
            <Button
              htmlType="submit"
              loading={this.getStatus().endsWith('ing')}
              size="large"
              icon="caret-right"
              type="primary"
            >
              Inspect
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedInspectionForm = Form.create({
  // mapPropsToFields(props) {
  //   Form.createFormField()
  // }
  onFieldsChange(props, _patch, data) {
    props.onChange(data);
  }
})(InspectionFormComponent);

function mapStateToProps(state) {
  return {
    formState: selectFormState(state),
    entities: state.entities
  };
}

const dispatchProps = {
  onChange: saveInspectForm,
  onInspect: inspectProject
};

export const InspectionForm = connect(
  mapStateToProps,
  dispatchProps
)(WrappedInspectionForm);
