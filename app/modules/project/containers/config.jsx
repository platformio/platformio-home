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

import * as pathlib from '@core/path';

import { Alert, Button, Dropdown, Icon, Input, Menu, Spin, Tabs, Tooltip } from 'antd';
import { ConfigOptionType, ProjectType, SchemaType } from '@project/types';
import {
  SCOPE_ENV,
  SCOPE_PLATFORMIO,
  SECTION_CUSTOM,
  SECTION_GLOBAL_ENV,
  SECTION_PLATFORMIO,
  SECTION_USER_ENV,
  TYPE_BOOL
} from '@project/constants';
import {
  loadConfigSchema,
  loadProjectConfig,
  saveProjectConfig
} from '@project/actions';
import { openTextDocument, osOpenUrl } from '@core/actions';
import {
  selectConfigSchema,
  selectProjectConfig,
  selectProjectInfo
} from '@project/selectors';

import { ConfigSectionForm } from '@project/components/config-section';
import { DraggableTabs } from '@project/components/draggable-tabs';
import { ManageSectionOptionsModal } from '@project/components/manage-options-modal';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import querystringify from 'querystringify';

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
    openTextDocument: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  };

  static iconBySectionType = {
    [SECTION_PLATFORMIO]: 'appstore',
    [SECTION_GLOBAL_ENV]: 'environment',
    [SECTION_USER_ENV]: 'environment',
    [SECTION_CUSTOM]: 'user'
  };

  sectionIdCounter = 0;

  constructor(...args) {
    super(...args);
    this.state = {
      manageOptionsModalVisible: false,
      showToc: false
    };
    // this.forms = {};
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
    const stateConfig = this.state.config.map(section => ({
      ...section,
      items: section.items.filter(option => {
        const scope = this.getSectionScope(this.getSectionType(section.section));
        const scopeSchema = (scope && this.props.schema[scope]) || [];
        const schema = scopeSchema.find(s => s.name === option.name);
        if (schema && schema.type === TYPE_BOOL && option.value === schema.default) {
          // Skip saving checkboxes with default values
          return false;
        }
        return true;
      })
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
      const config = this.props.initialConfig.map(section => ({
        ...section,
        id: this.generateSectionId(section)
      }));
      this.setState({
        config
      });

      // Restore active tab if section is present, otherwise display first
      this.setState(state => {
        if (
          state.activeTabKey === undefined ||
          !state.config.find(s => s.id === state.activeTabKey)
        ) {
          return {
            activeTabKey: state.config.length ? state.config[0].id : undefined
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

  generateSectionId(section) {
    return `${++this.sectionIdCounter}-${section.section}`;
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
    const newSection = {
      section: name,
      items: []
    };
    newSection.id = this.generateSectionId(newSection);

    this.setState(prevState => {
      return {
        config: [...prevState.config, newSection],
        activeTabKey: newSection.id
      };
    });
  }

  removeSection(targetKey) {
    this.setState(oldState => {
      const removedIdx = oldState.config.findIndex(s => s.id === targetKey);
      if (removedIdx === -1) {
        return;
      }

      const config = oldState.config.filter(s => s.id !== targetKey);
      const state = { config };

      // Fix active tab
      if (targetKey === oldState.activeTabKey) {
        if (removedIdx >= config.length) {
          state.activeTabKey = config[config.length - 1].id;
        } else {
          state.activeTabKey = config[removedIdx].id;
        }
      }

      return state;
    });
  }

  addSectionField(sectionName, name, value = '') {
    this.setState(prevState => {
      const field = {
        name,
        value
      };
      const oldSection = prevState.config.find(s => s.section === sectionName);
      const newSection = {
        ...oldSection,
        items: [...oldSection.items, field]
      };
      return {
        config: prevState.config.map(section =>
          section !== oldSection ? section : newSection
        )
      };
    });
  }

  removeSectionField(sectionName, name) {
    this.setState(prevState => {
      const oldSection = prevState.config.find(s => s.section === sectionName);
      const newSection = {
        ...oldSection,
        items: oldSection.items.filter(item => item.name !== name)
      };
      return {
        config: prevState.config.map(section =>
          section !== oldSection ? section : newSection
        )
      };
    });
  }

  updateSectionValue(sectionName, name, value) {
    this.setState(prevState => {
      const oldSection = prevState.config.find(s => s.section === sectionName);
      const newSection = {
        ...oldSection,
        items: oldSection.items.map(item =>
          item.name !== name ? item : { ...item, value }
        )
      };
      return {
        config: prevState.config.map(section =>
          section !== oldSection ? section : newSection
        )
      };
    });
  }

  renameSection(tabId, name) {
    this.setState(state => ({
      config: state.config.map(section => {
        if (section.id !== tabId) {
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

  handleRevertClick = () => {
    this.load();
  };

  handleOpen = () => {
    this.props.openTextDocument(
      pathlib.join(this.props.project.path, 'platformio.ini')
    );
  };

  handleTabChange = activeTabKey => {
    this.setState({ activeTabKey });
  };

  handleTabOrderChange = order => {
    this.setState(prevState => {
      const prevConfig = prevState.config;
      const config = prevConfig.slice().sort((a, b) => {
        const orderA = order.indexOf(a.id);
        const orderB = order.indexOf(b.id);

        if (orderA !== -1 && orderB !== -1) {
          return orderA - orderB;
        }
        if (orderA !== -1) {
          return -1;
        }
        if (orderB !== -1) {
          return 1;
        }
        // Preserve original order if is not overridden
        const ia = prevConfig.indexOf(a);
        const ib = prevConfig.indexOf(b);
        return ia - ib;
      });
      return { config };
    });
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

  handleReportIssueClick = () => {
    const reportIssueUrl =
      'https://github.com/platformio/platformio-home/issues/new?' +
      querystringify.stringify({
        title: 'Edit Project Config'
      });
    this.props.osOpenUrl(reportIssueUrl);
  };

  handleTocToggle = showToc => {
    this.setState({
      showToc
    });
  };

  handleShowManageOptionsModal = sectionName => {
    this.setState({
      manageOptionsModalVisible: true,
      manageOptionsModalArgs: {
        sectionName,
        initialOptions: this.state.config
          .find(s => s.section === sectionName)
          .items.map(option => option.name)
      }
    });
  };

  handleManageOptionsModalClose = result => {
    this.setState({
      manageOptionsModalVisible: false
    });
    if (!result) {
      return;
    }
    if (result.add) {
      result.add.forEach(name => {
        this.addSectionField(result.sectionName, name);
      });
    }
    if (result.remove) {
      result.remove.forEach(name => {
        this.removeSectionField(result.sectionName, name);
      });
    }
  };

  handleOptionRemove = (section, name) => {
    this.removeSectionField(section, name);
  };

  handleSectionChange = (section, values) => {
    Object.entries(values).forEach(([name, field]) => {
      this.updateSectionValue(section, name, field.value);
    });
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
          <Button icon="undo" onClick={this.handleRevertClick}>
            Revert
          </Button>
        </Button.Group>
        <Button.Group>
          <Button icon="folder-open" onClick={this.handleOpen}>
            Open
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

  renderNewSectionBtn() {
    const newSectionMenu = (
      <Menu onClick={this.handleNewSectionMenuClick}>
        {!this.sectionExists(SECTION_PLATFORMIO) && (
          <Menu.Item
            key={SECTION_PLATFORMIO}
            title="Saved as [platformio] section in the platformio.ini file"
          >
            PlatformIO Core
          </Menu.Item>
        )}
        {!this.sectionExists(SECTION_GLOBAL_ENV) && (
          <Menu.Item
            key={SECTION_GLOBAL_ENV}
            title="Saved as [env] section in the platformio.ini file"
          >
            Global environment
          </Menu.Item>
        )}
        <Menu.Item
          key={SECTION_USER_ENV}
          title='Every "User [env:***]" section automatically extends "Global [env]" options'
        >
          User environment
        </Menu.Item>
        {/* <Menu.Item key={SECTION_CUSTOM}>Custom section</Menu.Item> */}
      </Menu>
    );

    return (
      <Dropdown overlay={newSectionMenu} disabled={!this.isLoaded()}>
        <Button className="add-section-btn" icon="plus">
          Configuration <Icon type="down" />
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
      showToc: this.state.showToc,
      search: this.state.search,
      type,
      onChange: this.handleSectionChange,
      onDocumentationClick: this.handleDocumentationClick,
      onOptionRemove: this.handleOptionRemove,
      onShowManageOptions: this.handleShowManageOptionsModal,
      onTocToggle: this.handleTocToggle
    };
    return (
      <Tabs.TabPane
        key={key}
        size="small"
        tab={
          <Tooltip title={`Section [${section.section}]`}>
            <Icon type={this.getScopeIcon(section.section)} />
            {section.section.replace(SECTION_USER_ENV, '')}
          </Tooltip>
        }
      >
        <ConfigSectionForm {...props} />
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
        defaultActiveKey={
          this.state.config.length ? this.state.config[0].id : undefined
        }
        hideAdd
        onOrderChange={this.handleTabOrderChange}
        onChange={this.handleTabChange}
        onEdit={this.handleTabEdit}
        type="editable-card"
      >
        {this.state.config.map(section =>
          this.renderConfigSection(section.id, section)
        )}
      </DraggableTabs>
    );
  }

  render() {
    const modalOptions = this.state.manageOptionsModalArgs || {};
    const modalScope =
      modalOptions.sectionName &&
      this.getSectionScope(this.getSectionType(modalOptions.sectionName));
    const modalSchema =
      modalScope && this.props.schema && this.props.schema[modalScope];

    return (
      <div className="project-config-page">
        <ManageSectionOptionsModal
          initialOptions={modalOptions.initialOptions || []}
          onClose={this.handleManageOptionsModalClose}
          schema={modalSchema}
          sectionName={modalOptions.sectionName}
          visible={this.state.manageOptionsModalVisible}
        />
        <h1 className="block clearfix">
          <span>{this.props.project.name}</span>
          {this.renderFormActions()}
        </h1>
        <Alert
          className="block"
          message={
            <span>
              This a beta version of Project Configuration. Please back up{' '}
              <code>platformio.ini</code> before saving new changes. If you have any
              issues, <a onClick={this.handleReportIssueClick}>please report us</a>
            </span>
          }
          type="warning"
          showIcon
        />
        <div className="block">
          <Input.Search
            allowClear
            disabled={!this.isLoaded()}
            placeholder="Search settings"
            onSearch={this.handleSearch}
            style={{ width: '100%' }}
          />
        </div>
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
  openTextDocument,
  osOpenUrl,
  saveProjectConfig
};

export const ProjectConfigPage = connect(
  mapStateToProps,
  dispatchToProps
)(ProjectConfig);
