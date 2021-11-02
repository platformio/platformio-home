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
import * as path from '../../core/path';

import { Button, Col, Row, Select } from 'antd';

import CodeBeautifier from '../../core/containers/code-beautifier';
import PropTypes from 'prop-types';
import React from 'react';
import { cmpSort } from '../../core/helpers';
import { connect } from 'react-redux';

export class ProjectExampleItem {
  constructor(name, projectPath = undefined) {
    this.name = name;
    this.projectPath = projectPath;
    this._sources = [];
  }

  addSource(uri, title = undefined) {
    if (!title) {
      title = path.basename(uri);
    }
    this._sources.push({
      uri,
      title,
    });
  }

  getSources() {
    return this._sources.sort((a, b) =>
      cmpSort(a.title.toUpperCase(), b.title.toUpperCase())
    );
  }
}

export class ProjectExamplesWrapped extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.instanceOf(ProjectExampleItem).isRequired),

    addProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    importProject: PropTypes.func.isRequired,
  };

  constructor() {
    super(...arguments);
    this.state = {
      selectedItem: null,
      importInProgress: false,
    };
    if (this.props.items.length) {
      this.state.selectedItem = this.props.items[0];
    }
  }

  onDidChange(name) {
    this.setState({
      selectedItem: this.props.items.find((item) => item.name === name),
    });
  }

  onDidFilter(inputValue, option) {
    if (!inputValue) {
      return true;
    }
    return option.props.value.toLowerCase().includes(inputValue);
  }

  onDidImport() {
    this.setState({
      importInProgress: true,
    });
    this.props.importProject(this.state.selectedItem.projectPath, (err, location) => {
      this.setState({
        importInProgress: false,
      });
      if (!err) {
        this.props.addProject(location);
      }
    });
  }

  render() {
    if (!this.props.items.length) {
      return (
        <ul className="background-message text-center">
          <li>No items</li>
        </ul>
      );
    }
    return (
      <div>
        {this.renderExamplesBar()}
        {this.renderProjectSources()}
      </div>
    );
  }

  renderExamplesBar() {
    if (!this.state.selectedItem || !this.state.selectedItem.projectPath) {
      return <div className="block">{this.renderExamplesSelect()}</div>;
    }
    return (
      <Row gutter={8} className="block">
        <Col span={19}>{this.renderExamplesSelect()}</Col>
        <Col span={5}>
          <Button
            ghost
            type="primary"
            icon="folder-add"
            style={{ width: '100%' }}
            loading={this.state.importInProgress}
            onClick={::this.onDidImport}
          >
            {this.state.importInProgress ? 'Please wait...' : 'Import'}
          </Button>
        </Col>
      </Row>
    );
  }

  renderExamplesSelect() {
    return (
      <Select
        showSearch={true}
        defaultValue={this.props.items[0].name}
        filterOption={::this.onDidFilter}
        onChange={::this.onDidChange}
        style={{ width: '100%' }}
      >
        {this.props.items.map((item) => (
          <Select.Option key={item.name} value={item.name}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    );
  }

  renderProjectSources() {
    if (!this.state.selectedItem) {
      return;
    }
    const sources = this.state.selectedItem.getSources();
    return (
      <div>
        {sources.map((item, index) => (
          <CodeBeautifier
            key={item.uri}
            className="block"
            title={(sources.length > 1 ? `${index + 1}. ` : '') + item.title}
            uri={item.uri}
            language={item.uri.endsWith('.ini') ? 'ini' : 'c'}
            toggle
          />
        ))}
      </div>
    );
  }
}

export const ProjectExamples = connect(null, actions)(ProjectExamplesWrapped);
