/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Alert, Button, Form, Icon, Input } from 'antd';

import CompanyLogo from '../../home/components/company-logo';
import PropTypes from 'prop-types';
import React from 'react';

export default class AccountRegistrationForm extends React.Component {

  static propTypes = {
    form: PropTypes.object.isRequired,
    registerAccount: PropTypes.func.isRequired,
    showLoginPage: PropTypes.func.isRequired,
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
      this.props.registerAccount(
        values.username,
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
      <Form onSubmit={ ::this.onDidSubmit } className='account-form'>
        <Form.Item>
          <br />
          <CompanyLogo />
        </Form.Item>
        <Form.Item>
          { getFieldDecorator('username', {
              rules: [{
                type: 'email',
                required: true,
                message: 'Please input valid email (we\'ll send further details)'
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
            Create Your PIO Account
          </Button>
          <div>
            Already have an account? <a onClick={ () => this.props.showLoginPage() }>Log in.</a>
          </div>
        </Form.Item>
      </Form>);
  }

}
