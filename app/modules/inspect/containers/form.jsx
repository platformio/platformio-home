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
import {
  selectProjectInspectionMeta,
  selectSavedConfiguration
} from '@inspect/selectors';

import { ConfigurationType } from '@inspect/types';
import { ProjectEnvSelect } from '@inspect/containers/project-env-select';
import { ProjectSelect } from '@project/containers/project-select';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { inspectProject } from '@inspect/actions';

class InspectionFormComponent extends React.Component {
  static propTypes = {
    envs: PropTypes.arrayOf(PropTypes.string.isRequired),
    // Antd generated Form
    form: PropTypes.object,
    // Saved Redux form state
    savedConfiguration: ConfigurationType,
    meta: PropTypes.shape({
      status: PropTypes.string,
      error: PropTypes.string
    }),
    onInspect: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    const { form, savedConfiguration } = this.props;
    form.setFieldsValue(savedConfiguration);
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
    this.props.onInspect(configuration, true);
  };

  render() {
    const { form, meta } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { status = '', error } = meta;

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
            {getFieldDecorator('projectDir')(<ProjectSelect />)}
          </Form.Item>

          <Form.Item label="Environment" {...itemLayout}>
            {getFieldDecorator('env')(
              <ProjectEnvSelect project={getFieldValue('projectDir')} />
            )}
          </Form.Item>

          <Form.Item wrapperCol={{ span: 14, offset: labelSpan }}>
            <span className="ant-form-item-label" style={{ marginRight: 15 }}>
              <label>Inspect Memory</label>
              {getFieldDecorator('memory', {
                valuePropName: 'checked',
                initialValue: true
              })(<Switch onChange={this.handleMemorySwitch} />)}
            </span>
            <span className="ant-form-item-label">
              <label>Check Code</label>
              {getFieldDecorator('code', {
                valuePropName: 'checked',
                initialValue: true
              })(<Switch onChange={this.handleCodeSwitch} />)}
            </span>
          </Form.Item>

          <Form.Item {...buttonsLayout}>
            <Button
              htmlType="submit"
              disabled={!this.isValid()}
              loading={status.endsWith('ing')}
              size="large"
              icon="caret-right"
              type="primary"
            >
              Inspect
            </Button>
          </Form.Item>
        </Form>
        {error && <textarea value={error} />}
      </div>
    );
  }
}

const WrappedInspectionForm = Form.create()(InspectionFormComponent);

function mapStateToProps(state) {
  return {
    meta: selectProjectInspectionMeta(state) || {},
    savedConfiguration: selectSavedConfiguration(state)
  };
}

const dispatchProps = {
  onInspect: inspectProject
};

export const InspectionForm = connect(
  mapStateToProps,
  dispatchProps
)(WrappedInspectionForm);
