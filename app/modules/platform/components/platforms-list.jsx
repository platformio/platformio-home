/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as workspaceSettings from '../../../workspace/settings';

import { Button, Input, Spin } from 'antd';

import PlatformCard from './platform-card';
import PlatformInstallAdvancedModal from '../containers/install-advanced-modal';
import PropTypes from 'prop-types';
import React from 'react';


export default class PlatformsList extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    actions: PropTypes.arrayOf(PropTypes.string),
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    installPlatform: PropTypes.func.isRequired,
    uninstallPlatform: PropTypes.func.isRequired,
    updatePlatform: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      advancedVisible: false
    };
  }

  onDidFilter(value) {
    this.props.setFilter(value);
  }

  onDidAdvanced() {
    this.setState({
      advancedVisible: true
    });
  }

  onDidCancelAdvanced() {
    this.setState({
      advancedVisible: false
    });
  }

  render() {
    if (!this.props.items) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }

    return (
      <div>
        { workspaceSettings.get('showFilterByPlatforms', true) && this.renderAdvanced() }
        { this.props.items && this.props.items.length === 0 &&
          <ul className='background-message text-center'>
            <li>
              No Results
            </li>
          </ul> }
        { this.props.items.filter(item => workspaceSettings.get('filterPlatformCard', () => true)(item)).map(item => (
            <PlatformCard key={ item.__pkg_dir || item.name } item={ item } { ...this.props } />
          )) }
      </div>
      );
  }

  renderAdvanced() {
    return (
      <div>
        <PlatformInstallAdvancedModal visible={ this.state.advancedVisible } onCancel={ ::this.onDidCancelAdvanced } />
        <Input.Search className='block'
          placeholder='Filter platforms by name...'
          defaultValue={ this.props.filterValue }
          size='large'
          onChange={ e => this.onDidFilter(e.target.value) }
          ref={ item => item ? item.focus() : null } />
        <div className='block text-right'>
          <Button.Group>
            <Button ghost
              type='primary'
              icon='download'
              disabled={ this.state.advancedVisible }
              onClick={ (e) => this.onDidAdvanced(e) }>
              Advanced Installation
            </Button>
            <Button ghost
              type='primary'
              icon='plus-circle-o'
              onClick={ () => this.props.osOpenUrl('http://docs.platformio.org/page/platforms/creating_platform.html') }>
              Custom Platform
            </Button>
          </Button.Group>
        </div>
      </div>
      );
  }

}
