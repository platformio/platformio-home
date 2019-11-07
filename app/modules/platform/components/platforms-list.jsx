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

import * as workspaceSettings from '../../../workspace/settings';

import { Button, Input, Spin } from 'antd';

import PlatformCard from './platform-card';
import PlatformInstallAdvancedModal from '../containers/install-advanced-modal';
import PropTypes from 'prop-types';
import React from 'react';

export default class PlatformsList extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object.isRequired),
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
  };

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
        <div className="text-center">
          <Spin tip="Loading..." size="large" />
        </div>
      );
    }

    return (
      <div>
        {!workspaceSettings.get('singleDevPlatform') && this.renderAdvanced()}
        {this.props.items && this.props.items.length === 0 && (
          <ul className="background-message text-center">
            <li>No Results</li>
          </ul>
        )}
        {this.props.items
          .filter(item => workspaceSettings.get('filterPlatformCard', () => true)(item))
          .map(item => (
            <PlatformCard
              key={item.__pkg_dir || item.name}
              item={item}
              {...this.props}
            />
          ))}
      </div>
    );
  }

  renderAdvanced() {
    return (
      <div>
        <PlatformInstallAdvancedModal
          visible={this.state.advancedVisible}
          onCancel={::this.onDidCancelAdvanced}
        />
        <Input.Search
          allowClear
          className="block"
          placeholder="Filter platforms by name..."
          defaultValue={this.props.filterValue}
          size="large"
          onChange={e => this.onDidFilter(e.target.value)}
          ref={item => (item ? item.focus() : null)}
        />
        <div className="block text-right">
          <Button.Group>
            <Button
              ghost
              type="primary"
              icon="download"
              disabled={this.state.advancedVisible}
              onClick={e => this.onDidAdvanced(e)}
            >
              Advanced Installation
            </Button>
            <Button
              ghost
              type="primary"
              icon="plus-circle-o"
              onClick={() =>
                this.props.osOpenUrl(
                  'http://docs.platformio.org/page/platforms/creating_platform.html'
                )
              }
            >
              Custom Platform
            </Button>
          </Button.Group>
        </div>
      </div>
    );
  }
}
