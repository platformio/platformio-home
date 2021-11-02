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

import * as path from '../../core/path';

import { Button, Modal, message } from 'antd';

import FileExplorer from '../../core/containers/file-explorer';
import PropTypes from 'prop-types';
import React from 'react';
import { addProject } from '../actions';
import { connect } from 'react-redux';

class ProjectOpenModal extends React.Component {
  static propTypes = {
    // data
    skipOpenProject: PropTypes.bool,
    visible: PropTypes.bool,
    // callbacks
    onCancel: PropTypes.func.isRequired,
    // dispatch
    addProject: PropTypes.func.isRequired,
  };

  constructor() {
    super(...arguments);
    this.state = {
      projectDir: null,
      checking: false,
    };
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  onDidOpen() {
    if (!this.state.projectDir) {
      return message.error('Please select Project Folder');
    }
    this.setState({ checking: true });
    this.props.addProject(this.state.projectDir, {
      withOpen: !this.props.skipOpenProject,
      onEnd: (err, projectDir) => {
        if (this._mounted) {
          this.setState({ checking: false });
          if (err) {
            return message.error(err);
          }
          this.props.onCancel(projectDir);
        }
      },
    });
  }

  onDidCancel() {
    this.props.onCancel();
  }

  onDidSelect(projectDir) {
    this.setState({
      projectDir,
    });
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        className="project-open-modal"
        width={600}
        title="Open PlatformIO Project"
        onOk={::this.onDidOpen}
        onCancel={::this.onDidCancel}
        footer={this.renderFooter()}
      >
        <FileExplorer ask="directory" onSelect={::this.onDidSelect} />
      </Modal>
    );
  }

  renderFooter() {
    return [
      <Button key="cancel" size="large" onClick={::this.onDidCancel}>
        Cancel
      </Button>,
      <Button
        key="submit"
        type="primary"
        size="large"
        disabled={!this.state.projectDir || this.state.checking}
        loading={this.state.checking}
        onClick={::this.onDidOpen}
      >
        {'Open' +
          (this.state.projectDir ? ` "${path.basename(this.state.projectDir)}"` : '')}
      </Button>,
    ];
  }
}

// Redux

export default connect(undefined, {
  addProject,
})(ProjectOpenModal);
