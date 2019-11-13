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

import * as actions from '../actions';

import { Input, Modal } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { osOpenUrl } from '../../core/actions';

class PlatformInstallAdvancedModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    installPlatform: PropTypes.func.isRequired,
    loadInstalledPlatforms: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      value: null,
      installing: false
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

  onDidValue(value) {
    this.setState({
      value
    });
  }

  onDidInstall() {
    if (!this.state.value) {
      this.focus();
      return;
    }
    this.setState({
      installing: true
    });
    this.props.installPlatform(this.state.value, err => {
      this.setState({ installing: false });
      if (!err) {
        this.props.loadInstalledPlatforms();
        this.onDidCancel();
      }
    });
  }

  onDidCancel() {
    this.setState({
      value: null,
      installing: false
    });
    this.props.onCancel();
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        confirmLoading={this.state.installing}
        title="Advanced platform installation"
        okText="Install"
        onOk={::this.onDidInstall}
        onCancel={::this.onDidCancel}
      >
        <Input
          className="block"
          placeholder="Platform name, repository, requirements..."
          size="large"
          value={this.state.value}
          onChange={e => this.onDidValue(e.target.value)}
          onPressEnter={::this.onDidInstall}
          ref={elm => (this._inputElement = elm)}
        />

        <ul className="block list-styled">
          <li>
            <code>&lt;name&gt;</code> - Foo
          </li>
          <li>
            <code>&lt;name&gt;@&lt;version&gt;</code> - Foo@1.2.3 or Foo@~1.2.3
          </li>
          <li>
            <code>&lt;name&gt;@&lt;version range&gt;</code> - Foo@!=1.2.0
          </li>
          <li>
            <code>&lt;zip or tarball url&gt;</code>
          </li>
          <li>
            <code>file://&lt;zip or tarball file&gt;</code>
          </li>
          <li>
            <code>file://&lt;folder&gt;</code>
          </li>
          <li>
            <code>&lt;repository&gt;</code>
          </li>
          <li>
            <code>&lt;name&gt;=&lt;repository&gt;</code> (name it should have locally)
          </li>
          <li>
            <code>&lt;repository#tag&gt;</code> (&quot;tag&quot; can be commit, branch
            or tag)
          </li>
          <li>
            <a
              onClick={() =>
                this.props.osOpenUrl(
                  'http://docs.platformio.org/page/userguide/platforms/cmd_install.html'
                )
              }
            >
              more (docs)...
            </a>
          </li>
        </ul>

        <div className="block">
          Project can depend on a specific version of development platform, please use{' '}
          <code>platform = name@x.y.z</code> option in <b>platformio.ini</b> in this
          case.{' '}
          <a
            onClick={() =>
              this.props.osOpenUrl(
                'http://docs.platformio.org/page/projectconf/section_env_general.html#platform'
              )
            }
          >
            More details...
          </a>
        </div>
      </Modal>
    );
  }
}

// Redux

export default connect(null, { ...actions, osOpenUrl })(PlatformInstallAdvancedModal);
