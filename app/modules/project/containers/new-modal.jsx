/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { Alert, Carousel, Checkbox, Form, Icon, Modal, Select, Spin, Tooltip, message } from 'antd';

import FileExplorer from '../../core/containers/file-explorer';
import PropTypes from 'prop-types';
import React from 'react';
import { cmpSort } from '../../core/helpers';
import { connect } from 'react-redux';
import fuzzaldrin from 'fuzzaldrin-plus';
import { loadBoards } from '../../platform/actions';
import { openUrl } from '../../core/actions';
import { selectNormalizedBoards } from '../../platform/selectors';
import { selectStorageItem } from '../../../store/selectors';


class ProjectNewModal extends React.Component {

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,

    boards: PropTypes.array,
    projectsDir: PropTypes.string,

    loadBoards: PropTypes.func.isRequired,
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

  componentWillReceiveProps(newProps) {
    if (newProps.visible) {
      this.props.loadBoards();
    }
  }

  onDidBoard(boardId) {
    const frameworks = (this.props.boards.find(item => item.id === boardId) || {}).frameworks || [];
    this.setState({
      selectedBoard: boardId,
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
      <Modal className='project-new-modal'
        visible={ this.props.visible }
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
    if (!this.props.boards) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }

    if (this.state.inProgress) {
      return this.renderCarousel();
    }

    const data = {};
    this.props.boards
      .sort((a, b) => cmpSort(a.platform.title.toUpperCase(), b.platform.title.toUpperCase()))
      .forEach(item => {
        const group = item.platform.title;
        const candidates = data.hasOwnProperty(group) ? data[group] : [];
        candidates.push(item);
        data[group] = candidates;
      });

    console.warn(this.state);
    return (
      <Form>
        <Form.Item label='Board' labelCol={ { span: 4 } } wrapperCol={ { span: 20 } }>
          <Select showSearch
            style={ { width: '100%' } }
            size='large'
            placeholder={ `Select a board (${ this.props.boards.length } available)` }
            optionFilterProp='children'
            filterOption={ (input, option) => fuzzaldrin.match(option.props.children, input).length }
            onChange={ ::this.onDidBoard }>
            { Object.keys(data).map(group => (
                <Select.OptGroup key={ group } label={ <span><Icon type='desktop' /> { group }</span> }>
                  { data[group].map(item => (
                      <Select.Option key={ item.id } value={ item.id }>
                        { item.name.includes(item.vendor) ? item.name : `${item.name} (${item.vendor})` }
                      </Select.Option>
                    )) }
                </Select.OptGroup>
              )) }
          </Select>
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
            Use default location <Tooltip title={ `Default location for PlatformIO Projects is: "${this.props.projectsDir}"` } overlayStyle={{ wordBreak: 'break-all' }}><Icon type='info-circle-o' /></Tooltip>
          </Checkbox>
        </Form.Item>
        { !this.state.useDefaultLocation && this.renderExplorer() }
      </Form> );
  }

  renderExplorer() {
    return <FileExplorer pick='folder' onSelect={ ::this.onDidProjectDir } />;
  }

  renderCarousel() {
    return (
      <Carousel autoplay autoplaySpeed={ 3000 }>
        <div>
          <Alert showIcon message='Project Structure' description={ (
          <div>
            <p className='block'>
              PlatformIO project consists of 3 main items:
            </p>
            <ul>
              <li>
                <Icon type='folder' /> <code>lib</code> - put here project specific (private) libraries
              </li>
              <li>
                <Icon type='folder' /> <code>src</code> - put your source files in this folder
              </li>
              <li>
                <Icon type='file' /> <code>platformio.ini</code> - project configuration file
              </li>
            </ul>
          </div>
        ) } />
        </div>
        <div>
          <Alert showIcon message='platformio.ini' description={ (
          <div>
            <p>
              PlatformIO Project Configuration File:
            </p>
            <ul className='block list-styled'>
              <li>
                <code>Build options</code> - build flags, source filter, extra scripting
              </li>
              <li>
                <code>Upload options</code> - custom port, speed and extra flags
              </li>
              <li>
                <code>Library options</code> - dependencies, extra library storages
              </li>
            </ul>
            <p>
              <a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/projectconf.html') }>
                <Icon type='link' /> Please visit documentation</a> for the other options and examples.
            </p>
          </div>
        ) } />
        </div>
        <div>
          <Alert showIcon message='Upload Port' description={ (
          <div>
            <p className='block'>
              PlatformIO automatically detects upoad port by default. However, you can configure a custom port using <code>upload_port</code> option in <b>platformio.ini</b>:
            </p>
            <ul className='block list-styled'>
              <li>
                <code>upload_port = COM1</code> - particular port
              </li>
              <li>
                <code>upload_port = /dev/ttyUSB*</code> - any port that starts with /dev/ttyUSB
              </li>
              <li>
                <code>upload_port = COM[13]</code> - COM1 or COM3.
              </li>
            </ul>
          </div>
        ) } />
        </div>
      </Carousel>
      );
  }

}

// Redux

function mapStateToProps(state) {
  return {
    boards: selectNormalizedBoards(state),
    projectsDir: selectStorageItem(state, 'projectsDir')
  };
}

export default connect(mapStateToProps, {
  ...actions,
  loadBoards,
  openUrl
})(ProjectNewModal);
