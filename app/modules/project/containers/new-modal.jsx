/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { Checkbox, Form, Icon, Modal, Select, Tooltip, message } from 'antd';

import BoardSelect from '../../platform/containers/board-select';
import FileExplorer from '../../core/containers/file-explorer';
import ProjectInitCarousel from '../components/init-carousel';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { openUrl } from '../../core/actions';
import { selectStorageItem } from '../../../store/selectors';


class ProjectNewModal extends React.Component {

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,

    projectsDir: PropTypes.string,

    addProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    initProject: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      selectedBoard: null,
      selectedFramework: null,
      useDefaultLocation: true,
      frameworks: [],
      projectDir: null,
      inProgress: false
    };
  }

  onDidBoard(board) {
    const frameworks = board.frameworks || [];
    this.setState({
      selectedBoard: board.id,
      selectedFramework: frameworks.length ? frameworks[0].name : null,
      frameworks
    });
  }

  onDidFramework(framework) {
    this.setState({
      selectedFramework: framework
    });
  }

  onDidUseDefaultLocation(e) {
    this.setState({
      useDefaultLocation: e.target.checked
    });
  }

  onDidProjectDir(projectDir) {
    this.setState({
      projectDir
    });
  }


  onDidFinish() {
    if (!this.state.selectedBoard) {
      return message.error('Please select a board');
    }
    if (!this.state.useDefaultLocation && !this.state.projectDir) {
      return message.error('Please select a custom project location');
    }
    this.setState({
      inProgress: true
    });
    this.props.initProject(
      this.state.selectedBoard,
      this.state.selectedFramework,
      this.state.projectDir,
      (err, location) => {
        this.setState({
          inProgress: false
        });
        if (!err) {
          this.props.addProject(location);
          this.props.openProject(location);
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
      <Modal visible={ this.props.visible }
        confirmLoading={ this.state.inProgress }
        width={ 600 }
        title='Project Wizard'
        okText={ this.state.inProgress ? 'Please wait...' : 'Finish' }
        onOk={ ::this.onDidFinish }
        onCancel={ ::this.onDidCancel }>
        { this.renderBody() }
      </Modal>
      );
  }

  renderBody() {
    if (this.state.inProgress) {
      return <ProjectInitCarousel openUrl={ this.props.openUrl } />;
    }

    return (
      <Form>
        <Form.Item label='Board' labelCol={ { span: 4 } } wrapperCol={ { span: 20 } }>
          <BoardSelect onSelect={ ::this.onDidBoard } />
        </Form.Item>
        <Form.Item label='Framework' labelCol={ { span: 4 } } wrapperCol={ { span: 20 } }>
          <Select value={ this.state.selectedFramework }
            style={ { width: '100%' } }
            size='large'
            disabled={ !this.state.selectedFramework }
            onChange={ ::this.onDidFramework }>
            { this.state.frameworks.map(item => (
                <Select.Option key={ item.name } value={ item.name } title={ item.title }>
                  { item.title }
                </Select.Option>
              )) }
          </Select>
        </Form.Item>
        <Form.Item label='Location' labelCol={ { span: 4 } } wrapperCol={ { span: 20 } }>
          <Checkbox onChange={ ::this.onDidUseDefaultLocation } checked={ this.state.useDefaultLocation }>
            Use default location
            <Tooltip title={ `Default location for PlatformIO Projects is: "${this.props.projectsDir}"` } overlayStyle={ { wordBreak: 'break-all' } }>
              <Icon type='question-circle' style={{ marginLeft: '5px' }} />
            </Tooltip>
          </Checkbox>
        </Form.Item>
        { !this.state.useDefaultLocation && this.renderExplorer() }
      </Form> );
  }

  renderExplorer() {
    return <FileExplorer pick='folder' onSelect={ ::this.onDidProjectDir } />;
  }

}

// Redux

function mapStateToProps(state) {
  return {
    projectsDir: selectStorageItem(state, 'projectsDir')
  };
}

export default connect(mapStateToProps, {
  ...actions,
  openUrl
})(ProjectNewModal);
