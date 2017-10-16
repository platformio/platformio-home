/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { Button, Icon, Modal, Select, Spin, message } from 'antd';
import { cmpSort, goTo } from '../../core/helpers';

import ProjectInitCarousel from '../components/init-carousel';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { openUrl } from '../../core/actions';
import { selectProjectExamples } from '../selectors';


class ProjectExamplesModal extends React.Component {

  static propTypes = {
    router: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,

    items: PropTypes.array,

    loadProjectExamples: PropTypes.func.isRequired,
    addProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    importProject: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired,
    showInstalledPlatforms: PropTypes.func.isRequired,
    showEmbeddedPlatforms: PropTypes.func.isRequired,
    showDesktopPlatforms: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      examplePath: null,
      inProgress: false
    };
  }

  componentWillReceiveProps(newProps) {
    if (!newProps.visible || this.props.items) {
      return;
    }
    this.props.loadProjectExamples();
  }

  onDidExample(examplePath) {
    this.setState({
      examplePath
    });
  }

  onDidFinish() {
    if (!this.state.examplePath) {
      return message.error('Please select an example');
    }
    this.setState({
      inProgress: true
    });
    this.props.importProject(
      this.state.examplePath,
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
        title='Import Project Example'
        okText={ this.state.inProgress ? 'Please wait...' : 'Import' }
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

    if (!this.props.items) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }
    if (this.props.items.length === 0) {
      return this.renderNoExamples();
    }

    const data = {};
    this.props.items
      .sort((a, b) => cmpSort(a.platform.toUpperCase(), b.platform.toUpperCase()))
      .forEach(item => {
        const group = item.platform;
        const candidates = data.hasOwnProperty(group) ? data[group] : [];
        candidates.push(item);
        data[group] = candidates;
      });

    return (
      <div>
        <div className='block'>
          We use examples provided by <a onClick={ () => this.props.showInstalledPlatforms() }>installed development platforms</a>. Please install more platforms to see the new examples.
        </div>
        <Select showSearch
          style={ { width: '100%' } }
          size='large'
          placeholder='Select an example...'
          filterOption={ (input, option) => option.key.toLowerCase().includes(input.toLowerCase()) }
          onChange={ ::this.onDidExample }>
          { Object.keys(data).map(group => (
              <Select.OptGroup key={ group } label={ <span><Icon type='desktop' /> { group }</span> }>
                { data[group].sort((a, b) => cmpSort(a.name.toUpperCase(), b.name.toUpperCase())).map(item => (
                    <Select.Option key={ `${group} ${item.path}` } value={ item.path }>
                      { item.name }
                    </Select.Option>
                  )) }
              </Select.OptGroup>
            )) }
        </Select>
      </div>
      );
  }

  renderNoExamples() {
    return (
      <div className='text-center'>
        <ul className='block background-message text-center'>
          <li>
            No Examples
          </li>
        </ul>
        <br />
        <div className='block'>
          We use examples from installed development platforms. Please install the one of them.
        </div>
        <ul className='list-inline'>
          <li>
            <Button icon='download' type='primary' onClick={ () => this.props.showEmbeddedPlatforms() }>
              Install Embedded Platform
            </Button>
          </li>
          <li>
            or
          </li>
          <li>
            <Button icon='download' type='primary' onClick={ () => this.props.showDesktopPlatforms() }>
              Install Desktop Platform
            </Button>
          </li>
        </ul>
      </div>
      );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectProjectExamples(state),
    showInstalledPlatforms: () => goTo(ownProps.router.history, '/platforms/installed'),
    showEmbeddedPlatforms: () => goTo(ownProps.router.history, '/platforms/embedded'),
    showDesktopPlatforms: () => goTo(ownProps.router.history, '/platforms/desktop')
  };
}

export default connect(mapStateToProps, {
  ...actions,
  openUrl
})(ProjectExamplesModal);
