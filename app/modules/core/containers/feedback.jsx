/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button, Input, Modal } from 'antd';
import { openUrl, sendFeedback } from '../actions';

import PropTypes from 'prop-types';
import React from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';


class Feedback extends React.Component {

  static propTypes = {
    sendFeedback: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      visible: false,
      loading: false,
      value: null
    };
  }

  componentDidUpdate() {
    setTimeout(() => this.focus(), 200);
  }

  focus() {
    if (this._inputElement) {
      this._inputElement.focus();
    }
  }

  onDidShow = () => {
    this.setState({
      visible: true
    });
    ReactGA.ga('send', 'screenview', {
      screenName: '/feedback'
    });
  }

  onDidCancel() {
    this.setState({
      visible: false,
      loading: false
    });
  }

  onDidValue(value) {
    this.setState({
      value
    });
  }

  onDidSend() {
    if (!this.state.value || !this.state.value.trim()) {
      this.focus();
      return;
    }
    this.setState({
      loading: true
    });
    this.props.sendFeedback(
      this.state.value,
      err => {
        this.setState({
          loading: false
        });
        if (!err) {
          this.setState({
            value: null
          });
          this.onDidCancel();
        }
      }
    );
  }

  render() {
    return (
      <div>
        <Button icon='smile-o' title='Anonymous Feedback' onClick={ ::this.onDidShow }></Button>
        <Modal visible={ this.state.visible }
          confirmLoading={ this.state.loading }
          title='What can we improve?'
          okText='Send feedback'
          onOk={ ::this.onDidSend }
          onCancel={ ::this.onDidCancel }>
          <p className='block'>
            For technical support, please visit our <a onClick={ () => this.props.openUrl('https://community.platformio.org/') }>awesome community forums</a>.
          </p>
          <p>
            Share your thoughts and feedback with the PlatformIO Team:
          </p>
          <p className='block'>
            <Input.TextArea autosize={ { minRows: 4, maxRows: 10 } } onChange={ (e) => this.onDidValue(e.target.value) } ref={ elm => this._inputElement = elm } />
          </p>
          <p>
            <small>The form is <b>anonymous</b> but if you would like a response, please add your email.</small>
          </p>
        </Modal>
      </div>
      );
  }

}

// Redux

export default connect(null, {
  sendFeedback,
  openUrl
})(Feedback);
