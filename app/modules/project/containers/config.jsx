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

import {
  Anchor,
  Button,
  Checkbox,
  Col,
  Dropdown,
  Form,
  Icon,
  Input,
  InputNumber,
  Menu,
  Row,
  Select,
  Spin,
  Tabs,
  Tag
} from 'antd';
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

import { ConfigFormItem } from '@project/components/config-form-item';
import { ProjectType } from '@project/types';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { osOpenUrl } from '@core/actions';

const SECTION_PLATFORMIO = 'platformio';
const SECTION_GLOBAL_ENV = 'env';
const SECTION_USER_ENV = 'env:';
const SECTION_CUSTOM = 'custom';

const SCOPE_PLATFORMIO = 'platformio';
const SCOPE_ENV = 'env';
const SCOPES = Object.freeze([SCOPE_PLATFORMIO, SCOPE_ENV]);

const TYPE_TEXT = 'string';
const TYPE_CHOICE = 'choice';
const TYPE_INT = 'integer';
const TYPE_INT_RANGE = 'integer range';
const TYPE_BOOL = 'boolean';
const TYPE_FILE = 'file';

const TYPES = Object.freeze([
  TYPE_TEXT,
  TYPE_CHOICE,
  TYPE_INT,
  TYPE_INT_RANGE,
  TYPE_BOOL,
  TYPE_FILE
]);

function escapeFieldName(x) {
  return x.replace(/\./g, '@');
}

function unescapeFieldName(x) {
  return x.replace(/@/g, '.');
}

function getDocumentationUrl(scope, group, name) {
  return `https://docs.platformio.org/en/latest/projectconf/section_${scope}_${group}.html#${name.replace(
    /[^a-z]/g,
    '-'
  )}`;
}

class ProjectConfigFormComponent extends React.PureComponent {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    project: ProjectType.isRequired,
    config: PropTypes.arrayOf(
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
    schema: PropTypes.arrayOf(
      PropTypes.shape({
        default: PropTypes.any,
        description: PropTypes.string,
        group: PropTypes.string,
        max: PropTypes.number,
        min: PropTypes.number,
        name: PropTypes.string.isRequired,
        multiple: PropTypes.bool,
        scope: PropTypes.oneOf(SCOPES).isRequired,
        type: PropTypes.oneOf(TYPES)
      })
    ),
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
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }

      const config = Object.entries(fieldsValue).map(([section, values]) => [
        section,
        Object.entries(values)
          .map(([name, value]) => [unescapeFieldName(name), value])
          .filter(item => item[1] !== undefined)
      ]);

      this.setState({
        saving: true
      });
      this.props.saveProjectConfig(this.props.location.state.projectDir, config, () => {
        this.setState({
          saving: false
        });
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.config &&
      this.props.schema &&
      (prevProps.config !== this.props.config || prevProps.schema !== this.props.schema)
    ) {
      // set form values
      const schemaByScopeAndName = this.generateIndexedSchema(this.props.schema);
      const values = {};
      for (const section of this.props.config) {
        for (const item of section.items) {
          const fieldName = this.generateFieldId(section.section, item);
          const sectionType = this.getSectionType(section.section);
          let value;

          if (sectionType === SECTION_CUSTOM) {
            // FIXME: can be array
            value = item.value;
          } else {
            const schema = schemaByScopeAndName[sectionType][item.name];
            if (schema.multiple && typeof item.value === 'string') {
              value = item.value.split(/[,\n]/);
            } else {
              value = item.value;
            }
            if (schema.type === TYPE_TEXT && schema.multiple) {
              value = value.join('\n');
            }
          }
          values[fieldName] = value;
        }
      }
      this.props.form.setFieldsValue(values);
    }
  }

  getSectionType(name) {
    if (name === SECTION_PLATFORMIO) {
      return SECTION_PLATFORMIO;
    }
    if (name === SECTION_GLOBAL_ENV || name.startsWith(SECTION_USER_ENV)) {
      return SECTION_GLOBAL_ENV;
    }
    return SECTION_CUSTOM;
  }

  getScopeIcon(name) {
    return ProjectConfigFormComponent.iconByScope[this.getSectionType(name)];
  }

  handleNewSectionMenuClick() {
    // TODO: create new section
  }

  handleSearch(search) {
    this.setState({
      search
    });
  }

  handleSaveClick() {
    this.save();
  }

  handleResetClick() {
    this.load();
  }

  handleShowOverriddenChange(e) {
    this.setState({
      showOverridden: e.target.checked
    });
  }

  renderDocLink(scope, group, name) {
    return (
      <div className="documentation-link">
        <a
          onClick={e => {
            e.preventDefault();
            this.props.osOpenUrl(getDocumentationUrl(scope, group, name), {
              target: '_blank'
            });
          }}
        >
          <Icon type="question-circle" />
        </a>
      </div>
    );
  }

  renderFormItem(sectionName, item, schemaByName) {
    const schema = (schemaByName || {})[item.name];
    const type = schema ? schema.type : TYPE_TEXT;
    const multiple = schema ? schema.multiple : true;
    const description = (schema || {}).description;
    const name = (
      <React.Fragment>
        {this.renderDocLink(schema.scope, schema.group, item.name)}
        {item.name}
      </React.Fragment>
    );
    const label = multiple ? (
      <React.Fragment>
        {name} <Tag size="small">ML</Tag>
      </React.Fragment>
    ) : (
      name
    );

    let input;
    if (type === TYPE_TEXT) {
      if (multiple) {
        input = <Input.TextArea autoSize={{ minRows: 1, maxRows: 20 }} rows={1} />;
      } else {
        input = <Input />;
      }
    } else if (type === TYPE_BOOL) {
      input = <Checkbox>{description}</Checkbox>;
    } else if (type === TYPE_CHOICE) {
      input = (
        <Select mode={multiple ? 'multiple' : 'default'} tokenSeparators={[',', '\n']}>
          {schema.choices.map(value => (
            <Select.Option key={value} value={value}>
              {value}
            </Select.Option>
          ))}
        </Select>
      );
    } else if ([TYPE_INT, TYPE_INT_RANGE].includes(type)) {
      const inputProps = {};
      if (type === TYPE_INT_RANGE) {
        inputProps.min = schema.min;
        inputProps.max = schema.max;
        // inputProps.defaultValue = schema.default
      }
      input = <InputNumber {...inputProps} />;
    } else if (type === TYPE_FILE) {
      // FIXME: change to file selector
      input = <Input />;
    } else {
      // Fallback
      input = <Input />;
      console.warn(`Unsupported item type: "${type}" for name: "${item.name}"`);
      // throw new Error(`Unsupported item type: "${type}"`);
    }
    const itemProps = {
      key: item.name,
      label,
      labelCol: {
        id: this.generateFieldLabelId(sectionName, item)
      }
    };
    if (type !== TYPE_BOOL) {
      itemProps.help = description;
    }
    const fieldName = this.generateFieldId(sectionName, item);
    const wrappedInput = this.props.form.getFieldDecorator(fieldName)(input);
    return <ConfigFormItem {...itemProps}>{wrappedInput}</ConfigFormItem>;
  }

  generateFieldId(sectionName, item) {
    return `${escapeFieldName(sectionName)}.${escapeFieldName(item.name)}`;
  }

  generateFieldLabelId(sectionName, item) {
    return `${sectionName}-${item.name}`;
  }

  renderLoader() {
    return <Spin size="large" tip="Loading…" />;
  }

  generateGroupAnchorId(sectionName, groupName) {
    return `section__${sectionName}--group__${groupName}`;
  }

  renderToC(sectionName, itemsByGroup, schemaByName, groupNames) {
    return (
      <Anchor className="toc">
        {groupNames.map(groupName => (
          <Anchor.Link
            className="config-section-group"
            href={`#${this.generateGroupAnchorId(groupName)}`}
            key={groupName}
            title={`${groupName} Options`}
          >
            {itemsByGroup[groupName].map(item => (
              <Anchor.Link
                href={`#${this.generateFieldLabelId(sectionName, item)}`}
                key={item.name}
                title={item.name}
              />
            ))}
          </Anchor.Link>
        ))}
      </Anchor>
    );
  }

  renderNoFilteredItems() {
    return (
      <ul className="background-message text-center">
        <li>No Results</li>
      </ul>
    );
  }

  renderEmptySection() {
    return (
      <ul className="background-message text-center">
        <li>No options defined!</li>
      </ul>
    );
  }

  renderSectionTabContent(section, schemaByName) {
    let sectionItems;
    if (this.state.showOverridden || !schemaByName) {
      sectionItems = section.items;
    } else {
      sectionItems = Object.keys(schemaByName).map(name => ({ name }));
    }

    if (!sectionItems.length) {
      return this.renderEmptySection();
    }
    const searchFilter = item =>
      this.state.search === undefined || item.name.includes(this.state.search);

    const filteredItems = sectionItems.filter(searchFilter);
    if (!filteredItems.length) {
      return this.renderNoFilteredItems();
    }
    const schemaGroupNames = schemaByName
      ? [...new Set(Object.values(schemaByName).map(x => x.group))]
      : ['Custom'];

    const itemsByGroup = Object.fromEntries(schemaGroupNames.map(name => [name, []]));
    for (const item of filteredItems) {
      const group = schemaByName ? schemaByName[item.name].group : 'Custom';
      itemsByGroup[group].push(item);
    }
    // Hide empty groups
    const groupNames = schemaGroupNames.filter(name => itemsByGroup[name].length);

    return (
      <Row gutter={0}>
        <Col xs={24} sm={9} md={6}>
          {this.renderToC(section.section, itemsByGroup, schemaByName, groupNames)}
        </Col>
        <Col xs={24} sm={15} md={18}>
          <Form layout="vertical" className="config-form">
            {groupNames.map(groupName => (
              <div key={groupName}>
                <h2
                  className="config-section-group"
                  id={this.generateGroupAnchorId(groupName)}
                >
                  {groupName} Options
                </h2>
                {itemsByGroup[groupName].map(item =>
                  this.renderFormItem(section.section, item, schemaByName)
                )}
              </div>
            ))}
          </Form>
        </Col>
      </Row>
    );
  }

  generateIndexedSchema(schema) {
    const result = Object.fromEntries(SCOPES.map(name => [name, {}]));
    for (const item of schema) {
      result[item.scope][item.name] = item;
    }
    return result;
  }

  renderFormActions() {
    return (
      <div className="form-actions-block">
        <Button.Group>{this.renderNewSectionBtn()}</Button.Group>
        <Button.Group>
          <Button icon="reload" onClick={::this.handleResetClick}>
            Reset
          </Button>
          <Button
            icon="save"
            loading={this.state.saving}
            type="primary"
            onClick={::this.handleSaveClick}
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
              placeholder="Search settings"
              onSearch={::this.handleSearch}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div className="filter-right">
          <Checkbox
            checked={this.state.showOverridden}
            onChange={::this.handleShowOverriddenChange}
          >
            Show overridden
          </Checkbox>
        </div>
      </div>
    );
  }

  renderNewSectionBtn() {
    const newSectionMenu = (
      <Menu onClick={::this.handleNewSectionMenuClick}>
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
      <Dropdown overlay={newSectionMenu}>
        <Button className="add-section-btn" icon="plus">
          Section <Icon type="down" />
        </Button>
      </Dropdown>
    );
  }

  render() {
    if (!this.props.schema || !this.props.config) {
      return this.renderLoader();
    }
    const schemaByScopeAndName = this.generateIndexedSchema(this.props.schema);
    return (
      <div className="project-config-page">
        <h1 className="block clearfix">
          <span>{this.props.project.name}</span>
          {this.renderFormActions()}
        </h1>
        {this.renderFilter()}
        <Tabs hideAdd defaultActiveKey={SECTION_PLATFORMIO} type="editable-card">
          {this.props.config.map(section => (
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
              {this.renderSectionTabContent(
                section,
                schemaByScopeAndName[this.getSectionType(section.section)]
              )}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = function(state, ownProps) {
  const { projectDir } = ownProps.location.state;

  return {
    project: selectProjectInfo(state, projectDir),
    schema: selectConfigSchema(state),
    config: selectProjectConfig(state)
  };
};
const dispatchToProps = {
  loadConfigSchema,
  loadProjectConfig,
  osOpenUrl,
  saveProjectConfig
};

const ConnectedProjectConfigFormComponent = connect(
  mapStateToProps,
  dispatchToProps
)(ProjectConfigFormComponent);

export const ProjectConfigPage = Form.create()(ConnectedProjectConfigFormComponent);
