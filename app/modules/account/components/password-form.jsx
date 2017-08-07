/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Form, Icon, Input } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';

export default class AccountPasswordForm extends React.Component {

  static propTypes = {
    form: PropTypes.object.isRequired,
    changeAccountPassword: PropTypes.func.isRequired,
    showForgotPage: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      loading: false
    };
  }

  onDidSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({
        loading: true
      });
      this.props.changeAccountPassword(
        values.passwordOld,
        values.passwordNew,
        () => {
          this.setState({
            loading: false
          });
        }
      );
    });
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <div className='text-left'>
        <div className='lead'>Change your password or recover your current one.</div>
        <Form onSubmit={ this.onDidSubmit } className='account-form'>
          <Form.Item>
            { getFieldDecorator('passwordOld', {
                rules: [{
                  required: true,
                  message: 'Please input your current password'
                }],
              })(
                <Input prefix={ <Icon type='lock' style={ { fontSize: 13 } } /> } type='password' placeholder='Current Password' />
              ) }
            <a onClick={ () => this.props.showForgotPage() }>Forgot your password?</a>
          </Form.Item>
          <Form.Item>
            { getFieldDecorator('passwordNew', {
                rules: [{
                  required: true,
                  message: 'Please input your new password'
                }],
              })(
                <Input prefix={ <Icon type='lock' style={ { fontSize: 13 } } /> } type='password' placeholder='New Password' />
              ) }
          </Form.Item>
          <Form.Item>
            <Button loading={ this.state.loading }
              type='primary'
              htmlType='submit'
              className='block account-submit-button'>
              Save changes
            </Button>
          </Form.Item>
        </Form>
      </div>
      );
  }

}
