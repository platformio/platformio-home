/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Alert, Collapse, Input, Modal, Select } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { installLibrary } from '../actions';
import { loadProjects } from '../../project/actions';
import { osOpenUrl } from '../../core/actions';
import { selectProjects } from '../../project/selectors';


class LibraryInstallAdvancedModal extends React.Component {

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    library: PropTypes.string,

    projects: PropTypes.array,

    installLibrary: PropTypes.func.isRequired,
    loadProjects: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      value: this.props.library || null,
      storageDir: null,
      installing: false
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.library) {
      this.setState({
        value: newProps.library
      });
    }
    if (newProps.visible) {
      this.props.loadProjects();
    }
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

  onDidStorage(storageDir) {
    this.setState({
      storageDir
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
    this.props.installLibrary(
      this.state.storageDir,
      this.state.value,
      err => {
        this.setState({
          installing: false
        });
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
    const projects = this.props.projects || [];
    return (
      <Modal visible={ this.props.visible }
        confirmLoading={ this.state.installing }
        title='Advanced library installation'
        width={ 600 }
        okText='Install'
        onOk={ ::this.onDidInstall }
        onCancel={ ::this.onDidCancel }>
        <Input.Group compact className='block'>
          <Input placeholder='Library id, name, repository, requirements...'
            size='large'
            style={ { width: '70%' } }
            value={ this.state.value }
            onChange={ (e) => this.onDidValue(e.target.value) }
            onPressEnter={ ::this.onDidInstall }
            ref={ elm => this._inputElement = elm } />
          <Select defaultValue='global'
            style={ { width: '30%' } }
            size='large'
            onChange={ ::this.onDidStorage }>
            <Select.Option value='global'>
              Global storage
            </Select.Option>
            <Select.OptGroup label='Projects'>
              { projects.map(item => (
                <Select.Option key={ item.path } value={ item.path } title={ item.path }>
                  { item.name }
                </Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label='Custom storage'>
              { projects.map(p => p.extraLibStorages.map(item => (
                <Select.Option key={ item.path } value={ item.path } title={ item.path }>
                  { item.name }
                </Select.Option>
              )))}
            </Select.OptGroup>
          </Select>
        </Input.Group>
        <hr />
        <Collapse defaultActiveKey={ ['storage'] }>
          <Collapse.Panel header='Storage types' key='storage'>
            <ul className='list-styled'>
              <li><b>Global storage</b> – libraries are visible for all projects</li>
              <li><b>Project storage</b> – libraries are visible only for the specified project</li>
              <li><b>Custom storage</b> – libraries are visible for project via <a onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/page/projectconf/section_env_library.html#projectconf-lib-extra-dirs') }>lib_extra_dirs</a> option.</li>
              <li><a onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/page/librarymanager/ldf.html#storage') }>More storages...</a></li>
            </ul>
          </Collapse.Panel>
          <Collapse.Panel header='Installation format' key='format'>
            <Alert showIcon className='block' message={ (
                <div>
                  PlatformIO Core has built-in powerful <a onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/page/librarymanager/index.html') }>Library Manager</a> that allows you to specify dependencies for specific project in <a onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/page/projectconf.html') }>Project Configuration File &quot;platformio.ini&quot;</a>  using <code>lib_deps</code> option. The dependent libraries will be installed automatically on the first build of a project. No need to install them manually.
                </div>
                ) } />
            <ul className='list-styled'>
              <li><code>&lt;id&gt;</code> - 12345</li>
              <li><code>id=&lt;id&gt;</code> - id=12345</li>
              <li><code>&lt;id&gt;@&lt;version&gt;</code> - 12345@1.2.3 or 12345@^1.2.3 (<a onClick={ () => this.props.osOpenUrl('http://semver.org/') }>Semantic Versioning</a>)</li>
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
              <li><a onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/page/userguide/lib/cmd_install.html') }>more in docs...</a></li>
            </ul>
          </Collapse.Panel>
        </Collapse>
      </Modal>
      );
  }

}

// Redux

function mapStateToProps(state) {
  return {
    projects: selectProjects(state)
  };
}

export default connect(mapStateToProps, {
  installLibrary,
  loadProjects,
  osOpenUrl
})(LibraryInstallAdvancedModal);
