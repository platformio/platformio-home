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
import { addProject, openProject } from '../actions';

import FileExplorer from '../../core/containers/file-explorer';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { osIsFile } from '../../core/actions';
import { selectOsIsFileItems } from '../../core/selectors';


class ProjectOpenModal extends React.Component {

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,

    osIsFileItems: PropTypes.object,
    addProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    osIsFile: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      projectDir: null,
      platformioIni: null,
      checking: false
    };
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (!this.state.checking) {
      return;
    }
    this.validateProjectDir(newProps.osIsFileItems);
  }

  validateProjectDir(osIsFileItems) {
    if (!osIsFileItems || !osIsFileItems.hasOwnProperty(this.state.platformioIni)) {
      if (!this.state.checking) {
        this.props.osIsFile(this.state.platformioIni);
      }
      this.setState({
        checking: true
      });
      return;
    }

    this.setState({
      checking: false
    });

    if (!osIsFileItems[this.state.platformioIni]) {
      return message.error('This is not PlatformIO Project (should contain "platformio.ini" file).');
    }
    this.props.addProject(this.state.projectDir);
    this.props.openProject(this.state.projectDir);
    this.onDidCancel();
  }

  onDidOpen() {
    if (!this.state.projectDir) {
      return message.error('Please select Project Folder');
    }
    this.validateProjectDir(this.props.osIsFileItems);
  }

  onDidCancel() {
    this.props.onCancel();
  }

  onDidSelect(projectDir) {
    this.setState({
      projectDir,
      platformioIni: projectDir ? path.join(projectDir, 'platformio.ini') : null
    });
  }

  render() {
    return (
      <Modal visible={ this.props.visible }
        className='project-open-modal'
        width={ 600 }
        title='Open PlatformIO Project'
        onOk={ ::this.onDidOpen }
        onCancel={ ::this.onDidCancel }
        footer={ this.renderFooter() }>
        <FileExplorer ask='directory' onSelect={ ::this.onDidSelect } />
      </Modal>
      );
  }

  renderFooter() {
    return [
      <Button key='cancel' size='large' onClick={ ::this.onDidCancel }>
        Cancel
      </Button>,
      <Button key='submit'
        type='primary'
        size='large'
        disabled={ !this.state.projectDir || this.state.checking }
        loading={ this.state.checking }
        onClick={ ::this.onDidOpen }>
        { 'Open' + (this.state.projectDir ? ` "${ path.basename(this.state.projectDir) }"` : '') }
      </Button>
    ];
  }

}

// Redux

function mapStateToProps(state) {
  return {
    osIsFileItems: selectOsIsFileItems(state)
  };
}

export default connect(mapStateToProps, {
  addProject,
  openProject,
  osIsFile
})(ProjectOpenModal);
