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

import { Collapse, Divider, Input, Modal, Select } from 'antd';

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
  };

  constructor() {
    super(...arguments);
    this.state = {
      library: null,
      storageDir: null,
      installing: false
    };
  }

  componentDidUpdate() {
    if (!this.props.visible) {
      return;
    }
    if (!this.props.projects) {
      this.props.loadProjects();
    }
    setTimeout(() => this.focus(), 200);
  }

  focus() {
    if (this._inputElement) {
      this._inputElement.focus();
    }
  }

  onDidLibraryChange(value) {
    this.setState({
      library: value
    });
  }

  onDidStorage(storageDir) {
    this.setState({
      storageDir
    });
  }

  onDidInstall() {
    if (!this.state.library) {
      this.focus();
      return;
    }
    this.setState({
      installing: true
    });
    this.props.installLibrary(this.state.storageDir, this.state.library, err => {
      this.setState({
        installing: false
      });
      if (!err) {
        this.onDidCancel();
      }
    });
  }

  onDidCancel() {
    this.setState({
      installing: false,
      library: null
    });
    this.props.onCancel();
  }

  render() {
    if (this.props.visible && !this.state.library && this.props.library) {
      this.setState({
        library: this.props.library
      });
    }
    const projects = this.props.projects || [];
    return (
      <Modal
        visible={this.props.visible}
        confirmLoading={this.state.installing}
        title="Advanced library installation"
        width={600}
        okText="Install"
        onOk={::this.onDidInstall}
        onCancel={::this.onDidCancel}
      >
        <div className="block">
          <Input
            placeholder="Library id, name, repository, requirements..."
            size="large"
            style={{ width: '100%' }}
            value={this.state.library}
            onChange={e => this.onDidLibraryChange(e.target.value)}
            onPressEnter={::this.onDidInstall}
            ref={elm => (this._inputElement = elm)}
          />
        </div>
        <div className="block">
          <Select
            defaultValue=""
            style={{ width: '100%' }}
            size="large"
            onChange={::this.onDidStorage}
          >
            <Select.Option value="">Global storage</Select.Option>
            <Select.OptGroup label="Projects">
              {projects.map(item => (
                <Select.Option key={item.path} value={item.path} title={item.path}>
                  {item.name}
                </Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label="Custom storage">
              {projects.map(p =>
                p.extraLibStorages.map(item => (
                  <Select.Option key={item.path} value={item.path} title={item.path}>
                    {item.name}
                  </Select.Option>
                ))
              )}
            </Select.OptGroup>
          </Select>
        </div>

        <Divider>Information</Divider>
        <Collapse>
          <Collapse.Panel
            header='Project dependencies in "platformio.ini"'
            key="lib_deps"
          >
            <div>
              PlatformIO Core has built-in powerful{' '}
              <a
                onClick={() =>
                  this.props.osOpenUrl(
                    'http://docs.platformio.org/page/librarymanager/index.html'
                  )
                }
              >
                Library Manager
              </a>{' '}
              that allows you to specify project dependencies in{' '}
              <b>configuration file &quot;platformio.ini&quot;</b> using{' '}
              <a
                onClick={() =>
                  this.props.osOpenUrl(
                    'http://docs.platformio.org/page/projectconf/section_env_library.html#lib-deps'
                  )
                }
              >
                lib_deps
              </a>{' '}
              option. The dependent libraries will be installed automatically on the
              first build of a project. <b>NO NEED TO INSTALL THEM MANUALLY.</b>
            </div>
          </Collapse.Panel>
          <Collapse.Panel header="Storage types" key="storage">
            <ul className="list-styled">
              <li>
                <b>Global storage</b> – libraries are visible for all projects
              </li>
              <li>
                <b>Project storage</b> – libraries are visible only for the specified
                project
              </li>
              <li>
                <b>Custom storage</b> – libraries are visible for project via{' '}
                <a
                  onClick={() =>
                    this.props.osOpenUrl(
                      'http://docs.platformio.org/page/projectconf/section_env_library.html#projectconf-lib-extra-dirs'
                    )
                  }
                >
                  lib_extra_dirs
                </a>{' '}
                option.
              </li>
              <li>
                <a
                  onClick={() =>
                    this.props.osOpenUrl(
                      'http://docs.platformio.org/page/librarymanager/ldf.html#storage'
                    )
                  }
                >
                  More storages...
                </a>
              </li>
            </ul>
          </Collapse.Panel>
          <Collapse.Panel header="Installation format" key="format">
            <ul className="list-styled">
              <li>
                <code>&lt;id&gt;</code> - 12345
              </li>
              <li>
                <code>id=&lt;id&gt;</code> - id=12345
              </li>
              <li>
                <code>&lt;id&gt;@&lt;version&gt;</code> - 12345@1.2.3 or 12345@^1.2.3 (
                <a onClick={() => this.props.osOpenUrl('http://semver.org/')}>
                  Semantic Versioning
                </a>
                )
              </li>
              <li>
                <code>&lt;id&gt;@&lt;version range&gt;</code> -
                12345@&gt;0.1.0,!=0.2.0,&lt;0.3.0
              </li>
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
                <code>&lt;name&gt;=&lt;repository&gt;</code> (name it should have
                locally)
              </li>
              <li>
                <code>&lt;repository#tag&gt;</code> (&quot;tag&quot; can be commit,
                branch or tag)
              </li>
              <li>
                <a
                  onClick={() =>
                    this.props.osOpenUrl(
                      'http://docs.platformio.org/page/userguide/lib/cmd_install.html'
                    )
                  }
                >
                  more in docs...
                </a>
              </li>
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
