/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Form, Icon, Input } from 'antd';

import PlatformIOLogo from '../../home/components/pio-logo';
import PropTypes from 'prop-types';
import React from 'react';

export default class AccountForgotForm extends React.Component {

  static propTypes = {
    form: PropTypes.object.isRequired,
    forgotAccountPassword: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired,
    showRegistrationPage: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

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
      this.props.forgotAccountPassword(
        values.username,
        (err) => {
          this.setState({
            loading: false
          });
          if (!err) {
            this.props.showLoginPage();
          }
        }
      );
    });
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <div >
        <Form onSubmit={ ::this.onDidSubmit } className='account-form'>
          <Form.Item>
            <PlatformIOLogo />
          </Form.Item>
          <Form.Item>
            { getFieldDecorator('username', {
                rules: [{
                  type: 'email',
                  required: true,
                  message: 'Please input your email'
                }],
              })(
                <Input prefix={ <Icon type='user' style={ { fontSize: 13 } } /> } placeholder='Email' ref={ elm => elm.focus() } />
              ) }
          </Form.Item>
          <Form.Item>
            <Button loading={ this.state.loading }
              type='primary'
              htmlType='submit'
              className='block account-submit-button'>
              Send reset email
            </Button>
            <div>
              Need an Account? <a onClick={ () => this.props.showRegistrationPage() }>Create a new one.</a>
            </div>
          </Form.Item>
        </Form>
      </div>
      );
  }

}
