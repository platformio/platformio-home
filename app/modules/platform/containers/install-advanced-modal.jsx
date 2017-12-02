/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
  }

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
    this.props.installPlatform(
      this.state.value,
      err => {
        this.setState({installing: false});
        if (!err) {
          this.props.loadInstalledPlatforms();
          this.onDidCancel();
        }
      }
    );
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
        visible={ this.props.visible }
        confirmLoading={ this.state.installing }
        title='Advanced platform installation'
        okText='Install'
        onOk={ ::this.onDidInstall }
        onCancel={ ::this.onDidCancel }>
        <Input
          className='block input-search-lg'
          placeholder='Platform name, repository, requirements...'
          size='large'
          value={ this.state.value }
          onChange={ (e) => this.onDidValue(e.target.value) }
          onPressEnter={ ::this.onDidInstall }
          ref={ elm => this._inputElement = elm } />

        <ul className='block list-styled'>
          <li><code>&lt;name&gt;</code> - Foo</li>
          <li><code>&lt;name&gt;@&lt;version&gt;</code> - Foo@1.2.3 or Foo@~1.2.3</li>
          <li><code>&lt;name&gt;@&lt;version range&gt;</code>  - Foo@!=1.2.0</li>
          <li><code>&lt;zip or tarball url&gt;</code></li>
          <li><code>file://&lt;zip or tarball file&gt;</code></li>
          <li><code>file://&lt;folder&gt;</code></li>
          <li><code>&lt;repository&gt;</code></li>
          <li><code>&lt;name&gt;=&lt;repository&gt;</code> (name it should have locally)</li>
          <li><code>&lt;repository#tag&gt;</code> (&quot;tag&quot; can be commit, branch or tag)</li>
          <li><a onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/page/userguide/platforms/cmd_install.html') }>more (docs)...</a></li>
        </ul>

        <div className='block'>
          Project can depend on a specific version of development platform, please use <code>platform = name@x.y.z</code> option in <b>platformio.ini</b> in this case. <a onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/page/projectconf/section_env_general.html#platform') }>More details...</a>
        </div>
      </Modal>
    );
  }

}

// Redux

export default connect(null, { ...actions, osOpenUrl })(PlatformInstallAdvancedModal);
