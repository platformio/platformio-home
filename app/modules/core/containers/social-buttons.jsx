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

import * as workspaceSettings from '../../../workspace/settings';

import { Button } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { osOpenUrl } from '../actions';

class SocialButtons extends React.Component {
  static propTypes = {
    osOpenUrl: PropTypes.func.isRequired,
  };

  render() {
    return (
      <Button.Group className="social-buttons">
        <Button
          icon="twitter"
          title="Follow us on Twitter"
          onClick={() => this.props.osOpenUrl(workspaceSettings.getUrl('twitter'))}
        >
          Follow Us
        </Button>
        {workspaceSettings.getUrl('facebook') ? (
          <Button
            icon="facebook"
            title="Follow us on Facebook"
            onClick={() => this.props.osOpenUrl(workspaceSettings.getUrl('facebook'))}
          ></Button>
        ) : null}
        {workspaceSettings.getUrl('weibo') ? (
          <Button
            icon="weibo"
            title="Follow us on Weibo"
            onClick={() => this.props.osOpenUrl(workspaceSettings.getUrl('weibo'))}
          ></Button>
        ) : null}
        <Button
          icon="linkedin"
          title="Follow us on LinkedIn"
          onClick={() => this.props.osOpenUrl(workspaceSettings.getUrl('linkedin'))}
        ></Button>
        <Button
          icon="github"
          title="Give Us a star on GitHub"
          onClick={() => this.props.osOpenUrl(workspaceSettings.getUrl('github'))}
        ></Button>
      </Button.Group>
    );
  }
}

// Redux

export default connect(null, {
  osOpenUrl,
})(SocialButtons);
