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

import { Button, Col, Form, Icon, Input, Row } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';

export default class AccountPasswordForm extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    changeAccountPassword: PropTypes.func.isRequired,
    showForgotPage: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      loading: false
    };
  }

  onDidSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({
        loading: true
      });
      this.props.changeAccountPassword(values.passwordOld, values.passwordNew, () => {
        this.setState({
          loading: false
        });
      });
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="text-left">
        <div className="lead">Change your password or recover your current one.</div>
        <Form onSubmit={::this.onDidSubmit} className="account-form">
          <Form.Item>
            {getFieldDecorator('passwordOld', {
              rules: [
                {
                  required: true,
                  message: 'Please input your current password'
                }
              ]
            })(
              <Input
                prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                type="password"
                placeholder="Current Password"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('passwordNew', {
              rules: [
                {
                  required: true,
                  pattern: '^(?=.*[a-z])(?=.*\\d).{8,}$',
                  message:
                    'Please input valid new password. ' +
                    'Must contain at least 8 characters ' +
                    'including a number and a lowercase letter'
                }
              ]
            })(
              <Input
                prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                type="password"
                placeholder="New Password"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Row>
              <Col xs={12} className="text-left">
                <a onClick={() => this.props.showForgotPage()}>Forgot your password?</a>
              </Col>
              <Col xs={12}>
                <Button
                  loading={this.state.loading}
                  type="primary"
                  htmlType="submit"
                  className="block account-submit-button"
                >
                  Save changes
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
