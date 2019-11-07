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

import {
  Alert,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Icon,
  Input,
  Row,
  message
} from 'antd';

import ClipboardJS from 'clipboard';
import PropTypes from 'prop-types';
import React from 'react';

export default class AccountTokenForm extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    token: PropTypes.string,
    showAccountToken: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      loading: false
    };
    this._clipboard = null;
  }

  componentDidMount() {
    this._clipboard = new ClipboardJS('.copy-token');
    this._clipboard.on('success', () =>
      message.success('Token has been copied to clipboard!')
    );
  }

  componentWillUnmount() {
    if (this._clipboard) {
      this._clipboard.destroy();
    }
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
      this.props.showAccountToken(values.password, values.regenerate, () => {
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
        <Alert
          showIcon
          message="Personal Authentication Token"
          className="block"
          description={
            <div>
              It is intended for{' '}
              <a
                onClick={() =>
                  this.props.osOpenUrl('http://docs.platformio.org/page/ci/index.html')
                }
              >
                Continuous Integration
              </a>{' '}
              systems,{' '}
              <a
                onClick={() =>
                  this.props.osOpenUrl(
                    'http://docs.platformio.org/page/plus/pio-remote.html'
                  )
                }
              >
                PIO Remote™
              </a>{' '}
              operations when you can not authenticate manually.
              <div>
                PlatformIO handles <b>Personal Authentication Token</b> from an
                environment variable{' '}
                <a
                  onClick={() =>
                    this.props.osOpenUrl(
                      'http://docs.platformio.org/page/envvars.html#envvar-PLATFORMIO_AUTH_TOKEN'
                    )
                  }
                >
                  PLATFORMIO_AUTH_TOKEN
                </a>
                .
              </div>
            </div>
          }
        />
        <Form onSubmit={::this.onDidSubmit} className="account-form">
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
            <Row>
              <Col xs={8} className="text-left">
                {getFieldDecorator('regenerate')(<Checkbox>Regenerate</Checkbox>)}
              </Col>
              <Col xs={16}>
                <Button
                  loading={this.state.loading}
                  type="primary"
                  htmlType="submit"
                  className="block account-submit-button"
                >
                  Show Token
                </Button>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item>{this.props.token && this.renderToken()}</Form.Item>
        </Form>
      </div>
    );
  }

  renderToken() {
    return (
      <div>
        <Divider>Token</Divider>
        <Input
          disabled
          size="large"
          style={{ width: '100%' }}
          addonAfter={
            <a className="copy-token" data-clipboard-text={this.props.token}>
              <Icon type="copy" />
            </a>
          }
          defaultValue={this.props.token}
        />
      </div>
    );
  }
}
