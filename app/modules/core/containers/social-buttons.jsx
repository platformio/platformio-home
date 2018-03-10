/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as workspaceSettings from '../../../workspace/settings';

import { Button } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { osOpenUrl } from '../actions';


class SocialButtons extends React.Component {

  static propTypes = {
    osOpenUrl: PropTypes.func.isRequired
  }

  render() {
    return (
      <Button.Group>
        <Button icon='twitter' title='Follow us on Twitter' onClick={ () => this.props.osOpenUrl(workspaceSettings.getUrl('twitter')) }>Follow Us</Button>
        { workspaceSettings.getUrl('facebook')? <Button icon='facebook' title='Follow us on Facebook' onClick={ () => this.props.osOpenUrl(workspaceSettings.getUrl('facebook')) }></Button> : null }
        { workspaceSettings.getUrl('weibo')? <Button icon='weibo' title='Follow us on Weibo' onClick={ () => this.props.osOpenUrl(workspaceSettings.getUrl('weibo')) }></Button> : null }
        <Button icon='linkedin' title='Follow us on LinkedIn' onClick={ () => this.props.osOpenUrl(workspaceSettings.getUrl('linkedin')) }></Button>
        <Button icon='github' title='Give Us a star on GitHub' onClick={ () => this.props.osOpenUrl(workspaceSettings.getUrl('github')) }></Button>
      </Button.Group>);
  }
}

// Redux

export default connect(null, {
  osOpenUrl
})(SocialButtons);
