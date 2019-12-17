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

import { Button, Dropdown, Icon, Menu, Modal, Spin, Tabs, Tooltip } from 'antd';
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

import { ConfigFileModifiedError } from '@project/errors';
import { ConfigSectionForm } from '@project/components/config-section';
import { DraggableTabs } from '@project/components/draggable-tabs';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import querystringify from 'querystringify';

class ProjectConfig extends React.PureComponent {
  static propTypes = {
    // data
    location: PropTypes.object.isRequired,
    mtime: PropTypes.number,
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
      showToc: false
    };
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

  save(force) {
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
      {
        force,
        mtime: this.props.mtime
      },
      err => {
        this.setState({
          saving: false
        });
        if (!force && err instanceof ConfigFileModifiedError) {
          Modal.confirm({
            autoFocusButton: 'cancel',
            content: (
              <p>
                Press &ldquo;Override&rdquo; to override and loose external changes;
                <br />
                Press &ldquo;Cancel&rdquo; to continue editing without saving
              </p>
            ),
            okText: 'Override',
            okType: 'danger',
            title: 'Do you want to override externally modified config?',
            onOk: () => {
              this.save(true);
            }
          });
        }
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
      this.setState(prevState => {
        if (prevState.activeTabKey === undefined || !this.getActiveSection(prevState)) {
          return {
            activeTabKey: prevState.config.length ? prevState.config[0].id : undefined
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

  getActiveSection(state) {
    if (!state) {
      state = this.state;
    }
    if (!state.config) {
      return;
    }
    return state.config.find(s => s.id === state.activeTabKey);
  }

  sectionExists(name, state) {
    if (!state) {
      state = this.state;
    }
    return state.config && state.config.findIndex(s => s.section === name) !== -1;
  }

  generateSectionId(section) {
    return `${++this.sectionIdCounter}-${section.section}`;
  }

  addSectionOfType(type, items) {
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
    this.addSection(name, items);
    this.setActiveSection(name);
  }

  setActiveSection(name) {
    this.setStrate(prevState => {
      const section = prevState.config.find(s => s.section === name);
      if (section) {
        return { activeTabKey: section.id };
      }
    });
  }

  addSection(name, items) {
    if (!items) {
      items = [];
    }
    const type = this.getSectionType(name);
    const newSection = {
      section: name,
      items
    };
    newSection.id = this.generateSectionId(newSection);

    this.setState(prevState => {
      let config;
      if (type === SECTION_PLATFORMIO) {
        config = [newSection, ...prevState.config];
      } else if (type === SECTION_GLOBAL_ENV) {
        let insertIdx = 0;
        const pioIdx = prevState.config.findIndex(
          s => s.section === SECTION_PLATFORMIO
        );
        if (pioIdx !== -1) {
          insertIdx = pioIdx + 1;
        } else {
          const firstEnvIdx = prevState.config.findIndex(
            s => this.getSectionType(s.section) === SECTION_USER_ENV
          );
          if (firstEnvIdx !== -1) {
            insertIdx = firstEnvIdx;
          }
        }
        config = prevState.config.slice();
        config.splice(insertIdx, 0, newSection);
      } else {
        config = [...prevState.config, newSection];
      }

      return {
        config
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
          if (config.length !== 0) {
            state.activeTabKey = config[config.length - 1].id;
          } else {
            state.activeTabKey = undefined;
          }
        } else {
          state.activeTabKey = config[removedIdx].id;
        }
      }

      return state;
    });
  }

  addSectionField(sectionName, name, value) {
    this.setState(prevState => {
      const scope = this.getSectionScope(this.getSectionType(sectionName));
      const scopeSchema = (scope && this.props.schema[scope]) || [];
      const schema = scopeSchema.find(s => s.name === name);
      if (value === undefined) {
        if (schema && schema.multiple) {
          value = [];
        } else {
          value = '';
        }
      }

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

  getSectionValue(sectionName, name, defaultValue) {
    const section = this.state.config.find(s => s.section === sectionName);
    if (!section) {
      return defaultValue;
    }
    const option = section.items.find(o => o.name === name);
    return option && option.value != undefined ? option.value : defaultValue;
  }

  _updateSectionValue(sectionName, name, valueUpdater) {
    const oldSection = this.state.config.find(s => s.section === sectionName);
    if (!oldSection) {
      this.addSection(sectionName, [
        {
          name,
          value: valueUpdater()
        }
      ]);
      return;
    }

    this.setState(prevState => {
      const oldSection = prevState.config.find(s => s.section === sectionName);
      if (!oldSection) {
        return;
      }
      const items = oldSection.items.slice();
      const optionIdx = oldSection.items.findIndex(item => item.name === name);
      if (optionIdx === -1) {
        items.push({
          name,
          value: valueUpdater()
        });
      } else {
        const oldItem = items[optionIdx];
        items[optionIdx] = { ...oldItem, value: valueUpdater(oldItem.value) };
      }
      const newSection = {
        ...oldSection,
        items
      };
      return {
        config: prevState.config.map(section =>
          section !== oldSection ? section : newSection
        )
      };
    });
  }

  updateSectionValue(sectionName, name, value) {
    this._updateSectionValue(sectionName, name, () => value);
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
    this.addSectionOfType(key);
  };

  handleNewSectionBtnClick = () => {
    this.addSectionOfType(SECTION_USER_ENV);
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

  handleSectionRemove = (_name, tabId) => {
    this.removeSection(tabId);
  };

  handleReportIssueClick = () => {
    const reportIssueUrl =
      'https://github.com/platformio/platformio-home/issues/new?' +
      querystringify.stringify({
        title: 'Edit Project Config'
      });
    this.props.osOpenUrl(reportIssueUrl);
  };

  handleToggleTocClick = () => {
    this.setState(prevState => ({
      showToc: !prevState.showToc
    }));
  };

  handleOptionAdd = (section, name) => {
    this.addSectionField(section, name);
    this.setState({
      autoFocus: {
        section,
        option: name
      }
    });
  };

  handleOptionRemove = (section, name) => {
    this.removeSectionField(section, name);
  };

  handleSectionChange = (section, values) => {
    let platformChanged = false;
    Object.entries(values).forEach(([name, field]) => {
      this.updateSectionValue(section, name, field.value);
      if (name === 'platform') {
        platformChanged = true;
      }
    });
    if (platformChanged) {
      for (const name of ['framework', 'board']) {
        this.updateSectionValue(section, name, undefined);
      }
      // Causes Warning: Can't perform a React state update on an unmounted component
      // if run inline
      setTimeout(() => {
        this.forceRerenderSection(section);
      }, 10);
    }
  };

  handleNewOptionSelect = name => {
    const sectionName = this.getActiveSection().section;
    this.addSectionField(sectionName, name);
    this.setState({
      autoFocus: {
        section: sectionName,
        option: name
      }
    });
  };

  handleDefaultToggle = (sectionName, isDefault) => {
    const env = sectionName.replace(SECTION_USER_ENV, '');
    const updater = isDefault
      ? oldValue => {
          const set = new Set(oldValue);
          set.add(env);
          return [...set];
        }
      : oldValue => {
          const set = new Set(oldValue);
          set.delete(env);
          return [...set];
        };
    this._updateSectionValue(SECTION_PLATFORMIO, 'default_envs', updater);
    this.forceRerenderSection(SECTION_PLATFORMIO);
  };

  forceRerenderSection(name) {
    // Force section rerender to overcome defaultValue side effect
    // by changing component id (used as key to render)
    this.setState(prevState => {
      const state = {};
      state.config = prevState.config.map(section => {
        if (section.section !== name) {
          return section;
        }
        const newId = this.generateSectionId(section);
        if (section.id === prevState.activeTabKey) {
          state.activeTabKey = newId;
        }
        return {
          ...section,
          id: newId
        };
      });
      return state;
    });
  }

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
        <Button.Group>
          <Tooltip
            placement="bottom"
            title={`${this.state.showToc ? 'Hide' : 'Show'} Table of Contents`}
          >
            <Button
              icon={this.state.showToc ? 'menu-fold' : 'menu-unfold'}
              onClick={this.handleToggleTocClick}
            />
          </Tooltip>

          <Tooltip
            placement="bottom"
            title="Cancel current changes and revert configuration to the initial state"
          >
            <Button icon="undo" onClick={this.handleRevertClick} />
          </Tooltip>
          <Tooltip placement="bottom" title="Open configuration file in a text editor">
            <Button icon="edit" onClick={this.handleOpen} />
          </Tooltip>
        </Button.Group>
        {this.renderNewSectionBtn()}
        <Button.Group>
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
        {!this.sectionExists(SECTION_GLOBAL_ENV) && (
          <Menu.Item
            key={SECTION_GLOBAL_ENV}
            title="Common configuration for all environments. Saved as [env] section in the `platformio.ini` file"
          >
            Common Configuration
          </Menu.Item>
        )}
        {!this.sectionExists(SECTION_PLATFORMIO) && (
          <Menu.Item
            key={SECTION_PLATFORMIO}
            title="Saved as [platformio] section in the platformio.ini file"
          >
            PlatformIO Settings
          </Menu.Item>
        )}
      </Menu>
    );
    if (newSectionMenu.props.children.filter(x => !!x).length) {
      return (
        <Dropdown.Button
          className="add-section-btn"
          disabled={!this.isLoaded()}
          overlay={newSectionMenu}
          onClick={this.handleNewSectionBtnClick}
        >
          <Icon type="plus" /> Configuration
        </Dropdown.Button>
      );
    }
    return (
      <Button
        className="add-section-btn"
        disabled={!this.isLoaded()}
        onClick={this.handleNewSectionBtnClick}
      >
        <Icon type="plus" /> Configuration
      </Button>
    );
  }

  renderConfigSection(key, section) {
    const name = section.section;
    const type = this.getSectionType(name);
    let tabName = name.replace(SECTION_USER_ENV, '');
    let title = 'Configuration';
    if (type === SECTION_GLOBAL_ENV) {
      title = tabName = 'Common Configuration';
    } else if (type === SECTION_PLATFORMIO) {
      title = tabName = 'PIO Configuration';
    } else if (type === SECTION_USER_ENV) {
      title = 'Working Configuration';
    }

    const props = {
      autoFocus:
        this.state.autoFocus && this.state.autoFocus.section === name
          ? this.state.autoFocus.option
          : undefined,
      // WARN: must be unique to avoid collisions between ids of subform fields
      id: key,
      name,
      initialValues: section.items,
      project: this.props.project,
      defaultEnv:
        type === SECTION_USER_ENV &&
        this.getSectionValue(SECTION_PLATFORMIO, 'default_envs', []).includes(
          name.replace(SECTION_USER_ENV, '')
        ),
      onRemove: this.handleSectionRemove,
      onRename: this.handleSectionRename,
      schema: this.props.schema[this.getSectionScope(type)] || [],
      showToc: this.state.showToc,
      title,
      type,
      onChange: this.handleSectionChange,
      onDefaultToggle: this.handleDefaultToggle,
      onDocumentationClick: this.handleDocumentationClick,
      onOptionAdd: this.handleOptionAdd,
      onOptionRemove: this.handleOptionRemove,
      onTocToggle: this.handleTocToggle
    };
    const tabCls = [`section-${type}-icon`];
    if (props.defaultEnv) {
      tabCls.push('default-env-icon');
    }

    return (
      <Tabs.TabPane
        key={key}
        size="small"
        tab={
          <Tooltip title={`Configuration [${name}]`}>
            <Icon className={tabCls.join(' ')} type={this.getScopeIcon(name)} />
            {tabName}
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
    if (!this.state.config.length) {
      return (
        <ul className="background-message option-like">
          <li>
            Please, use &ldquo;+ Configuration&rdquo; dropdown above to add new one
          </li>
        </ul>
      );
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
        type="card"
      >
        {this.state.config.map(section =>
          this.renderConfigSection(section.id, section)
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
        {this.renderConfig()}
      </div>
    );
  }
}

const mapStateToProps = function(state, ownProps) {
  const { projectDir } = ownProps.location.state;
  const config = selectProjectConfig(state) || {};
  return {
    project: selectProjectInfo(state, projectDir),
    schema: selectConfigSchema(state),
    initialConfig: config.config,
    mtime: config.mtime
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
