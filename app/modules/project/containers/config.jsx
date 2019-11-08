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

import { Button, Checkbox, Dropdown, Icon, Input, Menu, Spin, Tabs } from 'antd';
import { ProjectType, SchemaType } from '@project/types';
import {
  SECTION_CUSTOM,
  SECTION_GLOBAL_ENV,
  SECTION_NAME_KEY,
  SECTION_PLATFORMIO,
  SECTION_USER_ENV,
  TYPE_TEXT
} from '@project/constants';
import {
  loadConfigSchema,
  loadProjectConfig,
  saveProjectConfig
} from '@project/actions';

import {
  selectConfigSchema,
  selectProjectConfig,
  selectProjectInfo
} from '@project/selectors';

import { ConfigSectionForm } from '@project/components/config-section';
import { DraggableTabs } from '@project/components/draggable-tabs';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { osOpenUrl } from '@core/actions';

class ProjectConfig extends React.PureComponent {
  static propTypes = {
    location: PropTypes.object.isRequired,
    project: ProjectType.isRequired,
    initialConfig: PropTypes.arrayOf(
      PropTypes.shape({
        section: PropTypes.string.isRequired,
        items: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            value: PropTypes.any
          })
        )
      })
    ),
    schema: SchemaType,
    // callbacks
    loadConfigSchema: PropTypes.func.isRequired,
    loadProjectConfig: PropTypes.func.isRequired,
    saveProjectConfig: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  };

  static iconByScope = {
    [SECTION_PLATFORMIO]: 'appstore',
    [SECTION_GLOBAL_ENV]: 'environment',
    [SECTION_CUSTOM]: 'user'
  };

  constructor(...args) {
    super(...args);
    this.state = {
      showOverridden: true
    };
    this.forms = {};
  }

  componentDidMount() {
    if (!this.props.schema) {
      this.props.loadConfigSchema();
    }
    this.load();
  }

  load() {
    this.props.loadProjectConfig(this.props.location.state.projectDir);
  }

  save() {
    // Tabs use lazy render, so not all sections are present
    // FIXME: use validateFields?
    const renderedSectionsArr = Object.values(this.forms).map(x => x.getValues());
    const renderedItemsBySection = Object.fromEntries(
      renderedSectionsArr.map(({ section, items }) => [section, items])
    );
    const defaultItemsBySection = Object.fromEntries(
      this.props.initialConfig.map(({ section, items }) => [section, items])
    );

    const stateConfig = this.sectionsOrder.map(section => ({
      section,
      items: renderedItemsBySection[section] || defaultItemsBySection[section]
    }));
    const apiConfig = stateConfig.map(({ section, items }) => [
      section,
      items.map(({ name, value }) => [name, value])
    ]);

    this.setState({
      config: stateConfig.map(s => this.addSectionNameField(s)),
      saving: true
    });
    this.props.saveProjectConfig(
      this.props.location.state.projectDir,
      apiConfig,
      () => {
        this.setState({
          saving: false
        });
      }
    );
  }

  addSectionNameField(section) {
    return {
      ...section,
      items: [{ name: SECTION_NAME_KEY, value: section.section }, ...section.items]
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.initialConfig || !this.props.schema) {
      return;
    }

    if (
      prevProps.initialConfig !== this.props.initialConfig ||
      prevProps.schema !== this.props.schema
    ) {
      this.sectionsOrder = this.props.initialConfig.map(section => section.section);
      this.setState({
        config: this.props.initialConfig.map(section =>
          this.addSectionNameField(section)
        )
      });
      // Restore active tab if section is present, otherwise display first
      this.setState(state => {
        if (
          state.activeSection === undefined ||
          !this.props.initialConfig.find(
            section => section.section === state.activeSection
          )
        ) {
          return {
            activeSection: this.props.initialConfig.length
              ? this.props.initialConfig[0].section
              : undefined
          };
        }
      });
    }
  }

  getSectionType(name) {
    if (name === SECTION_PLATFORMIO || name === SECTION_GLOBAL_ENV) {
      return name;
    }
    if (name.startsWith(SECTION_USER_ENV)) {
      return SECTION_GLOBAL_ENV; // SECTION_USER_ENV;
    }
    return SECTION_CUSTOM;
  }

  getScopeIcon(name) {
    return ProjectConfig.iconByScope[this.getSectionType(name)];
  }

  handleNewSectionMenuClick = ({ key }) => {
    // TODO: create new sections
    if ([SECTION_PLATFORMIO, SECTION_GLOBAL_ENV].includes(key)) {
      this.setState(state => ({
        config: [
          ...state.config,
          this.addSectionNameField({
            section: key,
            items: []
          })
        ],
        activeSection: key
      }));
    }
  };

  handleSearch = search => {
    this.setState({
      search
    });
  };

  handleSaveClick = () => {
    this.save();
  };

  handleResetClick = () => {
    this.load();
  };

  handleShowOverriddenChange = e => {
    this.setState({
      showOverridden: e.target.checked
    });
  };

  handleTabChange = activeSection => {
    this.setState({ activeSection });
  };

  handleOrderChange = order => {
    this.sectionsOrder = order;
  };

  handleDocumentationClick = url => {
    this.props.osOpenUrl(url, {
      target: '_blank'
    });
  };

  isLoaded() {
    return Boolean(this.props.schema && this.props.initialConfig && this.state.config);
  }

  generateIndexedSchema(schema) {
    const result = Object.fromEntries(
      [SECTION_PLATFORMIO, SECTION_GLOBAL_ENV, SECTION_USER_ENV, SECTION_CUSTOM].map(
        name => [
          name,
          {
            [SECTION_NAME_KEY]: {
              name: SECTION_NAME_KEY,
              displayName: 'name',
              multiple: false,
              type: TYPE_TEXT,
              label: 'Section Name',
              group: 'Section',
              readonly: [SECTION_PLATFORMIO, SECTION_GLOBAL_ENV].includes(name)
            }
          }
        ]
      )
    );
    for (const item of schema) {
      result[item.scope][item.name] = item;
    }
    return result;
  }

  renderLoader() {
    return (
      <center>
        <Spin size="large" tip="Loading…" />
      </center>
    );
  }
  renderFormActions() {
    return (
      <div className="form-actions-block">
        <Button.Group>{this.renderNewSectionBtn()}</Button.Group>
        <Button.Group>
          <Button icon="reload" onClick={this.handleResetClick}>
            Reset
          </Button>
          <Button
            disabled={!this.isLoaded()}
            icon="save"
            loading={this.state.saving}
            type="primary"
            onClick={this.handleSaveClick}
          >
            Save
          </Button>
        </Button.Group>
      </div>
    );
  }

  renderFilter() {
    return (
      <div style={{ overflow: 'hidden' }}>
        <div className="block search-row">
          <div className="search-block">
            <Input.Search
              allowClear
              disabled={!this.isLoaded()}
              placeholder="Search settings"
              onSearch={this.handleSearch}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div className="filter-right">
          <Checkbox
            checked={this.state.showOverridden}
            disabled={!this.isLoaded()}
            onChange={this.handleShowOverriddenChange}
          >
            Show overridden
          </Checkbox>
        </div>
      </div>
    );
  }

  renderNewSectionBtn() {
    const newSectionMenu = (
      <Menu onClick={this.handleNewSectionMenuClick}>
        <Menu.Item key={SECTION_PLATFORMIO} title="PlatformIO Core options">
          [platformio]
        </Menu.Item>
        <Menu.Item
          key={SECTION_GLOBAL_ENV}
          title='Every "User [env:***]" section automatically extends "Global [env]" options'
        >
          Global [env]
        </Menu.Item>
        <Menu.Item key={SECTION_USER_ENV}>User [env:***]</Menu.Item>
        <Menu.Item key={SECTION_CUSTOM}>Custom section</Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={newSectionMenu} disabled={!this.isLoaded()}>
        <Button className="add-section-btn" icon="plus">
          Section <Icon type="down" />
        </Button>
      </Dropdown>
    );
  }

  renderConfigSection(section, schema) {
    const fields = section.items.map(({ name }) => name);
    const initialValues = Object.fromEntries(
      section.items.map(({ name, value }) => [name, value])
    );
    const props = {
      fields,
      // WARN: must be unique to avoid collisions between ids of subform fields
      idPrefix: section.section,
      initialValues,
      schema,
      showOverridden: this.state.showOverridden,
      search: this.state.search,
      onDocumentationClick: this.handleDocumentationClick
    };
    return (
      <Tabs.TabPane
        key={section.section}
        size="small"
        tab={
          <span>
            <Icon type={this.getScopeIcon(section.section)} />
            {section.section}
          </span>
        }
      >
        <ConfigSectionForm
          wrappedComponentRef={form => (this.forms[section.section] = form)}
          {...props}
        />
      </Tabs.TabPane>
    );
  }

  renderConfig() {
    if (!this.isLoaded()) {
      return this.renderLoader();
    }
    const schemaByScopeAndName = this.generateIndexedSchema(this.props.schema);
    return (
      <DraggableTabs
        activeKey={this.state.activeSection}
        defaultActiveKey={
          this.state.config.length ? this.state.config[0].section : undefined
        }
        hideAdd
        onOrderChange={this.handleOrderChange}
        onChange={this.handleTabChange}
        type="editable-card"
      >
        {this.state.config.map(section =>
          this.renderConfigSection(
            section,
            schemaByScopeAndName[this.getSectionType(section.section)]
          )
        )}
      </DraggableTabs>
    );
  }

  render() {
    return (
      <div className="project-config-page">
        <h1 className="block clearfix">
          <span>{this.props.project.name}</span>
          {this.renderFormActions()}
        </h1>
        {this.renderFilter()}
        {this.renderConfig()}
      </div>
    );
  }
}

const mapStateToProps = function(state, ownProps) {
  const { projectDir } = ownProps.location.state;

  return {
    project: selectProjectInfo(state, projectDir),
    schema: selectConfigSchema(state),
    initialConfig: selectProjectConfig(state)
  };
};

const dispatchToProps = {
  loadConfigSchema,
  loadProjectConfig,
  osOpenUrl,
  saveProjectConfig
};

export const ProjectConfigPage = connect(
  mapStateToProps,
  dispatchToProps
)(ProjectConfig);
