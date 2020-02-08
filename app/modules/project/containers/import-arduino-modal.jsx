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

import { Checkbox, Icon, Modal, Tooltip, message } from 'antd';

import BoardSelect from '../../platform/containers/board-select';
import FileExplorer from '../../core/containers/file-explorer';
import ProjectInitCarousel from '../components/init-carousel';
import PropTypes from 'prop-types';
import React from 'react';

import { connect } from 'react-redux';
import { osOpenUrl } from '../../core/actions';

class ProjectImportArduinoModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,

    boards: PropTypes.array,

    addProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    importArduinoProject: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      selectedBoard: null,
      useArduinoLibs: false,
      arduinoProjectDir: null,
      inProgress: false
    };
  }

  onDidBoard(board) {
    if (
      !board.frameworks ||
      !board.frameworks.map(item => item.name).includes('arduino')
    ) {
      this.setState({
        selectedBoard: null
      });
      return message.error(
        `Board ${board.name} is not compatible with Arduino framework`
      );
    }
    this.setState({
      selectedBoard: board.id
    });
  }

  onDidUseArduinoLibs(e) {
    this.setState({
      useArduinoLibs: e.target.checked
    });
  }

  onDidArduinoProjectDir(arduinoProjectDir) {
    this.setState({
      arduinoProjectDir
    });
  }

  onDidFinish() {
    if (!this.state.selectedBoard) {
      return message.error('Please select a board');
    }
    if (!this.state.arduinoProjectDir) {
      return message.error('Please select a folder with Arduino project');
    }
    this.setState({
      inProgress: true
    });
    this.props.importArduinoProject(
      this.state.selectedBoard,
      this.state.useArduinoLibs,
      this.state.arduinoProjectDir,
      (err, location) => {
        this.setState({
          inProgress: false
        });
        if (!err) {
          this.props.addProject(location, true);
          this.onDidCancel();
        }
      }
    );
  }

  onDidCancel() {
    this.setState({
      inProgress: false
    });
    this.props.onCancel();
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        confirmLoading={this.state.inProgress}
        width={600}
        title="Import Arduino Project"
        okText={this.state.inProgress ? 'Please wait...' : 'Import'}
        onOk={::this.onDidFinish}
        onCancel={::this.onDidCancel}
      >
        {this.renderBody()}
      </Modal>
    );
  }

  renderBody() {
    if (this.state.inProgress) {
      return <ProjectInitCarousel osOpenUrl={this.props.osOpenUrl} />;
    }

    return (
      <div>
        <div style={{ marginBottom: '5px' }}>
          Please select a board to initialize a project. You can change it later in{' '}
          <code>platformio.ini</code> file which will be created in a project directory:
        </div>
        <div className="block">
          <BoardSelect onChange={::this.onDidBoard} />
        </div>
        <div className="block">
          <Checkbox
            onChange={::this.onDidUseArduinoLibs}
            checked={this.state.useArduinoLibs}
          >
            Use libraries installed by Arduino IDE
            <Tooltip title="We highly recommend to use PlatformIO Library Manager">
              <Icon type="question-circle" style={{ marginLeft: '5px' }} />
            </Tooltip>
          </Checkbox>
        </div>
        <div style={{ marginBottom: '5px' }}>
          Choose a directory with existing Arduino IDE project:
        </div>
        <FileExplorer ask="directory" onSelect={::this.onDidArduinoProjectDir} />
      </div>
    );
  }
}

// Redux

export default connect(null, {
  ...actions,
  osOpenUrl
})(ProjectImportArduinoModal);
