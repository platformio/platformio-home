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

import { Button, Col, Divider, Form, Icon, Input, Row } from 'antd';

import CompanyLogo from '../../home/components/company-logo';
import PropTypes from 'prop-types';
import React from 'react';

export default class AccountLoginForm extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    loginAccount: PropTypes.func.isRequired,
    showInformationPage: PropTypes.func.isRequired,
    showRegistrationPage: PropTypes.func.isRequired,
    showForgotPage: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
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
      this.props.loginAccount(values.username, values.password, () => {
        this.setState({
          loading: false
        });
        this.props.showInformationPage();
      });
    });
  }

  render() {
    return (
      <div>
        <div className="login-logo">
          <CompanyLogo />
        </div>
        <Row>
          <Col xs={11} className="login-left-side">
            {this.renderBanner()}
          </Col>
          <Col xs={2}>
            <Divider type="vertical" />
          </Col>
          <Col xs={11} className="login-right-side">
            {this.renderForm()}
          </Col>
        </Row>
      </div>
    );
  }

  renderBanner() {
    return (
      <Row className="pioaccount-banner">
        <Col span={3}>
          <Icon type="info-circle-o" />
        </Col>
        <Col span={21}>
          <h2>PIO Account</h2>
          <p className="block">
            Having{' '}
            <a
              onClick={() =>
                this.props.osOpenUrl(
                  'http://docs.platformio.org/page/plus/pio-account.html'
                )
              }
            >
              PIO Account
            </a>{' '}
            allows you to use extra professional features:
          </p>
          <ul className="list-styled block">
            <li>
              <a
                onClick={() =>
                  this.props.osOpenUrl(
                    'http://docs.platformio.org/page/plus/pio-remote.html'
                  )
                }
              >
                PIO Remote
              </a>
            </li>
            <li>
              <a
                onClick={() =>
                  this.props.osOpenUrl('http://docs.platformio.org/page/ide.html')
                }
              >
                Integration with Cloud IDEs
              </a>
            </li>
          </ul>
        </Col>
      </Row>
    );
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={::this.onDidSubmit} className="account-form">
        <Form.Item>
          {getFieldDecorator('username', {
            rules: [
              {
                type: 'email',
                required: true,
                message: 'Please input your username (email)'
              }
            ]
          })(
            <Input
              prefix={<Icon type="user" style={{ fontSize: 13 }} />}
              placeholder="Email"
              ref={elm => elm.focus()}
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [
              {
                required: true,
                message: 'Please input your password'
              }
            ]
          })(
            <Input
              prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
              type="password"
              placeholder="Password"
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button
            loading={this.state.loading}
            type="primary"
            htmlType="submit"
            className="block account-submit-button"
          >
            Log in
          </Button>
          <div>
            <a onClick={() => this.props.showForgotPage()}>Forgot Password?</a>
          </div>
          <div>
            Need an Account?{' '}
            <a onClick={() => this.props.showRegistrationPage()}>Create a new one.</a>
          </div>
        </Form.Item>
      </Form>
    );
  }
}
