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

import { Collapse, Divider, Input, Modal, Select, message } from 'antd';

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
    osOpenUrl: PropTypes.func.isRequired,
  };

  constructor() {
    super(...arguments);
    this.state = {
      library: null,
      storageDir: null,
      installing: false,
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
      library: value,
    });
  }

  onDidStorage(storageDir) {
    this.setState({
      storageDir,
    });
  }

  onDidInstall() {
    if (!this.state.library) {
      this.focus();
      return;
    }
    if (!this.state.storageDir) {
      message.error('Please select a project!');
      return;
    }
    this.setState({
      installing: true,
    });
    this.props.installLibrary(this.state.storageDir, this.state.library, (err) => {
      this.setState({
        installing: false,
      });
      if (!err) {
        this.onDidCancel();
      }
    });
  }

  onDidCancel() {
    this.setState({
      installing: false,
      library: null,
    });
    this.props.onCancel();
  }

  render() {
    if (this.props.visible && !this.state.library && this.props.library) {
      this.setState({
        library: this.props.library,
      });
    }
    const projects = this.props.projects || [];
    return (
      <Modal
        visible={this.props.visible}
        confirmLoading={this.state.installing}
        title="Add project dependency"
        width={700}
        okText="Add"
        onOk={::this.onDidInstall}
        onCancel={::this.onDidCancel}
      >
        <div className="block">
          <Input
            placeholder="Library id, name, repository, requirements..."
            size="large"
            style={{ width: '100%' }}
            value={this.state.library}
            onChange={(e) => this.onDidLibraryChange(e.target.value)}
            onPressEnter={::this.onDidInstall}
            ref={(elm) => (this._inputElement = elm)}
          />
        </div>
        <div className="block">
          <Select
            placeholder="Select a project"
            style={{ width: '100%' }}
            size="large"
            onChange={::this.onDidStorage}
          >
            <Select.OptGroup label="Projects">
              {projects.map((item) => (
                <Select.Option key={item.path} value={item.path} title={item.path}>
                  {item.name}
                </Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label="Custom storage">
              {projects.map((p) =>
                p.extraLibStorages.map((item) => (
                  <Select.Option key={item.path} value={item.path} title={item.path}>
                    {item.name}
                  </Select.Option>
                ))
              )}
            </Select.OptGroup>
          </Select>

          <div>
            <small>
              You can manage your projects in the &quot;Projects&quot; section: create a
              new or add existing.
            </small>
          </div>
        </div>

        <Divider>Information</Divider>
        <Collapse>
          <Collapse.Panel header="Registry and Specification" key="spec">
            <p>
              The PlatformIO Registry is fully compatible with{' '}
              <a onClick={() => this.props.osOpenUrl('https://semver.org/')}>
                Semantic Versioning
              </a>{' '}
              and its &quot;version&quot; scheme{' '}
              <code>&lt;major&gt;.&lt;minor&gt;.&lt;patch&gt;</code>. You can declare
              library dependencies in &quot;platformio.ini&quot; configuration file
              using{' '}
              <a
                onClick={() =>
                  this.props.osOpenUrl(
                    'https://docs.platformio.org/page/projectconf/section_env_library.html#lib-deps'
                  )
                }
              >
                lib_deps
              </a>{' '}
              option. The following syntax is supported:
            </p>
            <ul>
              <li>
                <code>^1.2.3</code> - any compatible version (new functionality in a
                backwards compatible manner and patches are allowed, 1.x.x).{' '}
                <b>RECOMMENDED</b>
              </li>
              <li>
                <code>~1.2.3</code> - any version with the same major and minor
                versions, and an equal or greater patch version
              </li>
              <li>
                <code>&gt;1.2.3</code> - any version greater than 1.2.3. &gt;=, &lt;,
                and &lt;= are also possible
              </li>
              <li>
                <code>&gt;0.1.0,!=0.2.0,&lt;0.3.0</code> - any version greater than
                0.1.0, not equal to 0.2.0 and less than 0.3.0
              </li>
              <li>
                <code>1.2.3</code> - the exact version number. Use only this exact
                version
              </li>
            </ul>
          </Collapse.Panel>
          <Collapse.Panel header="External resources" key="format">
            <ul className="list-styled">
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
                <code>&lt;name&gt;=&lt;repository&gt;</code> (the &quot;name&quot; it
                should have locally)
              </li>
              <li>
                <code>&lt;repository#tag&gt;</code> (&quot;tag&quot; can be commit,
                branch or tag)
              </li>
              <li>
                <a
                  onClick={() =>
                    this.props.osOpenUrl(
                      'https://docs.platformio.org/page/userguide/lib/cmd_install.html'
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
    projects: selectProjects(state),
  };
}

export default connect(mapStateToProps, {
  installLibrary,
  loadProjects,
  osOpenUrl,
})(LibraryInstallAdvancedModal);
