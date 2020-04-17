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

export default class AccountProfileForm extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      profile: PropTypes.shape({
        username: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        firstname: PropTypes.string,
        lastname: PropTypes.string
      }).isRequired
    }).isRequired,
    form: PropTypes.object.isRequired,
    updateProfile: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      loading: false
    };
  }

  componentDidMount() {
    this.props.form.setFieldsValue({
      username: this.props.data.profile.username,
      email: this.props.data.profile.email,
      firstname: this.props.data.profile.firstname,
      lastname: this.props.data.profile.lastname
    });
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
      this.props.updateProfile(
        values.username,
        values.email,
        values.firstname,
        values.lastname,
        values.currentPassword,
        () => {
          this.setState({
            loading: false
          });
          this.props.form.resetFields('currentPassword');
        }
      );
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="text-left">
        <div className="lead">Update your profile.</div>
        <Form onSubmit={::this.onDidSubmit} className="account-form">
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [
                {
                  required: true,
                  pattern: '^[a-z\\d](?:[a-z\\d]|-(?=[a-z\\d])){3,38}$',
                  message:
                    'Please input valid username. ' +
                    'Must contain at least 4 characters including' +
                    ' single hyphens, and cannot begin or end with a hyphen'
                }
              ]
            })(
              <Input
                prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                placeholder="Username"
                ref={elm => elm.focus()}
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('email', {
              rules: [
                {
                  type: 'email',
                  required: true,
                  message: 'Please input valid email'
                }
              ]
            })(
              <Input
                prefix={<Icon type="mail" style={{ fontSize: 13 }} />}
                placeholder="Email"
                ref={elm => elm.focus()}
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('firstname', {
              rules: [
                {
                  required: true,
                  message: 'Please input last name'
                }
              ]
            })(
              <Input
                prefix={<Icon type="profile" style={{ fontSize: 13 }} />}
                placeholder="First name"
                ref={elm => elm.focus()}
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('lastname', {
              rules: [
                {
                  required: true,
                  message: 'Please input first name'
                }
              ]
            })(
              <Input
                prefix={<Icon type="profile" style={{ fontSize: 13 }} />}
                placeholder="Last Name"
                ref={elm => elm.focus()}
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('currentPassword', {
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
            <Row>
              <Col>
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
