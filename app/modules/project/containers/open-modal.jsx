/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as path from '../../core/path';

import { Button, Modal, message } from 'antd';
import { addProject, openProject } from '../actions';

import FileExplorer from '../../core/containers/file-explorer';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { isFile } from '../../core/actions';
import { selectIsFileItems } from '../../core/selectors';


class ProjectOpenModal extends React.Component {

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,

    isFileItems: PropTypes.object,
    addProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    isFile: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      projectDir: null,
      platformioIni: null,
      checking: false
    };
  }

  componentWillReceiveProps(newProps) {
    if (!this.state.checking) {
      return;
    }
    this.validateProjectDir(newProps.isFileItems);
  }

  validateProjectDir(isFileItems) {
    if (!isFileItems || !isFileItems.hasOwnProperty(this.state.platformioIni)) {
      if (!this.state.checking) {
        this.props.isFile(this.state.platformioIni);
      }
      this.setState({
        checking: true
      });
      return;
    }

    this.setState({
      checking: false
    });

    if (!isFileItems[this.state.platformioIni]) {
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
    this.validateProjectDir(this.props.isFileItems);
  }

  onDidCancel() {
    this.props.onCancel();
  }

  onDidSelect(projectDir) {
    this.setState({
      projectDir,
      platformioIni: path.join(projectDir, 'platformio.ini')
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
        <FileExplorer pick='folder' onSelect={ ::this.onDidSelect } />
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
    isFileItems: selectIsFileItems(state)
  };
}

export default connect(mapStateToProps, {
  addProject,
  openProject,
  isFile
})(ProjectOpenModal);
