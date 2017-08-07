/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Alert, Input, Modal } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { installLibrary } from '../actions';
import { openUrl } from '../../core/actions';


class LibraryInstallAdvancedModal extends React.Component {

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    installLibrary: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired
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
    const storageDir = null; // TODO: Custom storage directory
    this.props.installLibrary(
      storageDir,
      this.state.value,
      err => {
        this.setState({installing: false});
        if (!err) {
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
        title='Advanced library installation'
        width={ 600 }
        okText='Install'
        onOk={ ::this.onDidInstall }
        onCancel={ ::this.onDidCancel }>
        <Input
          className='block input-search-lg'
          placeholder='Library id, name, repository, requirements...'
          size='large'
          value={ this.state.value }
          onChange={ (e) => this.onDidValue(e.target.value) }
          onPressEnter={ ::this.onDidInstall }
          ref={ elm => this._inputElement = elm } />

        <ul className='block list-styled'>
          <li><code>&lt;id&gt;</code> - 12345</li>
          <li><code>id=&lt;id&gt;</code> - id=12345</li>
          <li><code>&lt;id&gt;@&lt;version&gt;</code> - 12345@1.2.3 or 12345@^1.2.3 (<a onClick={ () => this.props.openUrl('http://semver.org/') }>Semantic Versioning</a>)</li>
          <li><code>&lt;id&gt;@&lt;version range&gt;</code> - 12345@&gt;0.1.0,!=0.2.0,&lt;0.3.0</li>
          <li><code>&lt;name&gt;</code> - Foo</li>
          <li><code>&lt;name&gt;@&lt;version&gt;</code> - Foo@1.2.3 or Foo@~1.2.3</li>
          <li><code>&lt;name&gt;@&lt;version range&gt;</code>  - Foo@!=1.2.0</li>
          <li><code>&lt;zip or tarball url&gt;</code></li>
          <li><code>file://&lt;zip or tarball file&gt;</code></li>
          <li><code>file://&lt;folder&gt;</code></li>
          <li><code>&lt;repository&gt;</code></li>
          <li><code>&lt;name&gt;=&lt;repository&gt;</code> (name it should have locally)</li>
          <li><code>&lt;repository#tag&gt;</code> (&quot;tag&quot; can be commit, branch or tag)</li>
          <li><a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/userguide/lib/cmd_install.html') }>more (docs)...</a></li>
        </ul>

        <Alert showIcon message={
          <div>
            PlatformIO Core has built-in powerful <a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/librarymanager/index.html') }>Library Manager</a> that allows you to specify dependencies for specific project in <a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/projectconf.html') }>Project Configuration File &quot;platformio.ini&quot;</a> using <code>lib_deps</code> option.
            The dependent libraries will be installed automatically on the first build of a project. No need to install them manually.
          </div>
        } />
      </Modal>
    );
  }

}

// Redux

export default connect(null, { installLibrary, openUrl })(LibraryInstallAdvancedModal);
