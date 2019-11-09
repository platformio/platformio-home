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
import { ConfigOptionType, ProjectType, SchemaType } from '@project/types';
import {
  SCOPE_ENV,
  SCOPE_PLATFORMIO,
  SECTION_CUSTOM,
  SECTION_GLOBAL_ENV,
  SECTION_PLATFORMIO,
  SECTION_USER_ENV
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
    // data
    location: PropTypes.object.isRequired,
    project: ProjectType.isRequired,
    initialConfig: PropTypes.arrayOf(
      PropTypes.shape({
        section: PropTypes.string.isRequired,
        items: PropTypes.arrayOf(ConfigOptionType)
      })
    ),
    schema: PropTypes.shape({
      [SCOPE_PLATFORMIO]: SchemaType,
      [SCOPE_ENV]: SchemaType
    }),
    // callbacks
    loadConfigSchema: PropTypes.func.isRequired,
    loadProjectConfig: PropTypes.func.isRequired,
    saveProjectConfig: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  };

  static iconBySectionType = {
    [SECTION_PLATFORMIO]: 'appstore',
    [SECTION_GLOBAL_ENV]: 'environment',
    [SECTION_USER_ENV]: 'environment',
    [SECTION_CUSTOM]: 'user'
  };

  constructor(...args) {
    super(...args);
    this.state = {
      showOverridden: false
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
    if (this.state.search) {
      // FIXME: filtered form contains only values of fields matching criteria
      return;
    }

    const renderedSectionsArr = Object.values(this.forms)
      .filter(x => !!x)
      .map(section => ({
        section: this.state.config[parseInt(section.props.id)].section,
        items: section.getValues()
      }));
    const renderedItemsBySection = Object.fromEntries(
      renderedSectionsArr.map(({ section, items }) => [section, items])
    );
    const defaultItemsBySection = Object.fromEntries(
      this.props.initialConfig.map(({ section, items }) => [section, items])
    );

    const stateConfig = this.sectionsOrder
      .map(key => this.state.config[parseInt(key)].section)
      .map(section => ({
        section,
        items: renderedItemsBySection[section] || defaultItemsBySection[section]
      }));

    this.setState({
      config: stateConfig,
      saving: true
    });

    const apiConfig = stateConfig.map(({ section, items }) => [
      section,
      items.map(({ name, value }) => [name, value])
    ]);
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

  componentDidUpdate(prevProps) {
    if (!this.props.initialConfig || !this.props.schema) {
      return;
    }

    if (
      prevProps.initialConfig !== this.props.initialConfig ||
      prevProps.schema !== this.props.schema
    ) {
      this.sectionsOrder = this.props.initialConfig.map((_x, i) => i.toString());
      this.setState({
        config: this.props.initialConfig
      });
      // Restore active tab if section is present, otherwise display first
      this.setState(state => {
        if (
          state.activeTabKey === undefined ||
          parseInt(state.activeTabKey) >= this.props.initialConfig.length
        ) {
          return {
            activeTabKey: this.props.initialConfig.length ? '0' : undefined
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
      return SECTION_USER_ENV;
    }
    return SECTION_CUSTOM;
  }

  getSectionScope(type) {
    if (type === SECTION_PLATFORMIO) {
      return SCOPE_PLATFORMIO;
    }
    if (type === SECTION_USER_ENV || type === SECTION_GLOBAL_ENV) {
      return SCOPE_ENV;
    }
  }

  getScopeIcon(name) {
    return ProjectConfig.iconBySectionType[this.getSectionType(name)];
  }

  sectionExists(name) {
    return (
      this.state.config && this.state.config.findIndex(s => s.section === name) !== -1
    );
  }

  addSection(type) {
    let name;
    if ([SECTION_PLATFORMIO, SECTION_GLOBAL_ENV].includes(type)) {
      if (this.sectionExists(type)) {
        return;
      }
      name = type;
    } else if (type === SECTION_USER_ENV) {
      let i = 1;
      while (this.sectionExists((name = `${SECTION_USER_ENV}env${i}`))) {
        i++;
      }
    } else if (type === SECTION_CUSTOM) {
      let i = 1;
      while (this.sectionExists((name = `custom${i}`))) {
        i++;
      }
    }
    this.setState(
      state => {
        const config = [
          ...state.config,
          {
            section: name,
            items: []
          }
        ];
        return {
          config,
          activeTabKey: (config.length - 1).toString()
        };
      },
      () => {
        this.sectionsOrder.push(this.state.config.length - 1);
      }
    );
  }

  removeSection(targetKey) {
    this.setState(oldState => {
      const config = oldState.config.filter((s, i) => i !== parseInt(targetKey));
      this.sectionsOrder = this.sectionsOrder
        .filter(key => key !== targetKey)
        .map(key => (key - targetKey > 0 ? (key - 1).toString() : key));

      const state = { config };
      if (oldState.activeTabKey >= config.length) {
        state.activeTabKey = (config.length - 1).toString();
      }
      return state;
    });
  }

  renameSection(tabId, name) {
    const tabIdx = parseInt(tabId);
    this.setState(state => ({
      config: state.config.map((section, idx) => {
        if (idx !== tabIdx) {
          return section;
        }
        return {
          ...section,
          section: name
        };
      })
    }));
  }

  handleNewSectionMenuClick = ({ key }) => {
    this.addSection(key);
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

  handleTabChange = activeTabKey => {
    this.setState({ activeTabKey });
  };

  handleTabOrderChange = order => {
    this.sectionsOrder = order;
  };

  handleDocumentationClick = url => {
    this.props.osOpenUrl(url, {
      target: '_blank'
    });
  };

  handleSectionRename = (name, tabId) => {
    this.renameSection(tabId, name);
  };

  handleTabEdit = (targetKey, action) => {
    if (action === 'remove') {
      this.removeSection(targetKey);
    }
  };

  handleChildRefUpdate = form => {
    if (form) {
      // FIXME: gargabe collection?
      this.forms[form.props.id] = form;
    }
  };

  isLoaded() {
    return Boolean(this.props.schema && this.props.initialConfig && this.state.config);
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
            Show only overridden
          </Checkbox>
        </div>
      </div>
    );
  }

  renderNewSectionBtn() {
    const newSectionMenu = (
      <Menu onClick={this.handleNewSectionMenuClick}>
        {!this.sectionExists(SECTION_PLATFORMIO) && (
          <Menu.Item key={SECTION_PLATFORMIO} title="PlatformIO Core options">
            [platformio]
          </Menu.Item>
        )}
        {!this.sectionExists(SECTION_GLOBAL_ENV) && (
          <Menu.Item
            key={SECTION_GLOBAL_ENV}
            title='Every "User [env:***]" section automatically extends "Global [env]" options'
          >
            Global [env]
          </Menu.Item>
        )}
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

  renderConfigSection(key, section) {
    const type = this.getSectionType(section.section);
    const props = {
      // WARN: must be unique to avoid collisions between ids of subform fields
      id: key,
      name: section.section,
      initialValues: section.items,
      onRename: this.handleSectionRename,
      schema: this.props.schema[this.getSectionScope(type)] || [],
      showOverridden: this.state.showOverridden,
      search: this.state.search,
      type,
      onDocumentationClick: this.handleDocumentationClick
    };
    return (
      <Tabs.TabPane
        key={key}
        size="small"
        tab={
          <span>
            <Icon type={this.getScopeIcon(section.section)} />
            {section.section}
          </span>
        }
      >
        <ConfigSectionForm wrappedComponentRef={this.handleChildRefUpdate} {...props} />
      </Tabs.TabPane>
    );
  }

  renderConfig() {
    if (!this.isLoaded()) {
      return this.renderLoader();
    }
    return (
      <DraggableTabs
        activeKey={this.state.activeTabKey}
        defaultActiveKey={this.state.config.length ? '0' : undefined}
        hideAdd
        onOrderChange={this.handleTabOrderChange}
        onChange={this.handleTabChange}
        onEdit={this.handleTabEdit}
        type="editable-card"
      >
        {this.state.config.map((section, idx) =>
          this.renderConfigSection(idx.toString(), section)
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
