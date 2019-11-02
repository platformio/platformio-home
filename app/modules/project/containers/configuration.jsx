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
  Menu,
  Row,
  Select,
  Spin,
  Tabs
} from 'antd';
import { loadConfigSchema, loadProjectConfig } from '@project/actions';
import {
  selectConfigSchema,
  selectProjectConfig,
  selectProjectInfo
} from '@project/selectors';

import { ProjectType } from '@project/types';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

const { Search, TextArea } = Input;
const { TabPane } = Tabs;
const { Link } = Anchor;
const { Option } = Select;

const SECTION_PLATFORMIO = 'platformio';
const SECTION_GLOBAL_ENV = 'env';
const SECTION_USER_ENV = 'env:';
const SECTION_CUSTOM = 'custom';

const SECTIONS = Object.freeze([SECTION_PLATFORMIO, SECTION_GLOBAL_ENV, SECTION_CUSTOM]);

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

class ProjectSettingsFormComponent extends React.PureComponent {
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
        name: PropTypes.string.isRequired,
        multiple: PropTypes.bool,
        scope: PropTypes.string.isRequired,
        type: PropTypes.oneOf(TYPES)
      })
    ),
    // callbacks
    loadConfigSchema: PropTypes.func.isRequired,
    loadProjectConfig: PropTypes.func.isRequired
  };

  static iconByScope = {
    [SECTION_PLATFORMIO]: 'appstore',
    [SECTION_GLOBAL_ENV]: 'environment',
    [SECTION_CUSTOM]: 'user'
  };

  componentDidMount() {
    if (!this.props.schema) {
      this.props.loadConfigSchema();
    }
    this.props.loadProjectConfig(this.props.location.state.projectDir);
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
          const fieldName = this.generateFieldId(section, item);
          const schema =
            schemaByScopeAndName[this.getSectionScope(section.section)][item.name];

          let value;
          if (schema.multiple && typeof item.value === 'string') {
            value = item.value.split(/[,\n]/);
          } else {
            value = item.value;
          }
          if (schema.type === TYPE_TEXT && schema.multiple) {
            value = value.join('\n');
          }
          values[fieldName] = value;
        }
      }
      this.props.form.setFieldsValue(values);
    }
  }

  getSectionScope(name) {
    if (name === SECTION_PLATFORMIO) {
      return SECTION_PLATFORMIO;
    }
    if (name === SECTION_GLOBAL_ENV || name.startsWith(SECTION_USER_ENV)) {
      return SECTION_GLOBAL_ENV;
    }
    return SECTION_CUSTOM;
  }

  getScopeIcon(name) {
    return ProjectSettingsFormComponent.iconByScope[this.getSectionScope(name)];
  }

  handleNewSectionMenuClick() {
    // TODO: create new section
  }

  handleSearch() {
    // TODO: search
  }

  renderFormItem(section, item, schemaByName) {
    const schema = schemaByName[item.name] || {};
    const type = schema.type || TYPE_TEXT;

    let input;
    if (type === TYPE_TEXT) {
      if (schema.multiple) {
        input = <TextArea autoSize={{ minRows: 2, maxRows: 20 }} rows={2} />;
      } else {
        input = <Input />;
      }
    } else if (type === TYPE_BOOL) {
      input = <Checkbox>{item.name}</Checkbox>;
    } else if (type === TYPE_CHOICE) {
      input = (
        <Select
          mode={schema.multiple ? 'multiple' : 'default'}
          tokenSeparators={[',', '\n']}
        >
          {schema.choices.map(value => (
            <Option key={value} value={value}>
              {value}
            </Option>
          ))}
        </Select>
      );
    } else {
      throw new Error(`Unsupported item type: "${type}"`);
    }
    const itemProps = {
      help: schema.description,
      key: item.name
    };
    if (type !== TYPE_BOOL) {
      itemProps.label = item.name;
    }
    const fieldName = this.generateFieldId(section, item);
    const wrappedInput = this.props.form.getFieldDecorator(fieldName)(input);
    return <Form.Item {...itemProps}>{wrappedInput}</Form.Item>;
  }

  generateFieldId(section, item) {
    return `${encodeURIComponent(section.section)}.${item.name}`;
  }

  renderLoader() {
    return <Spin size="large" tip="Loading…" />;
  }

  generateGroupAnchorId(sectionName, groupName) {
    return `section__${encodeURIComponent(sectionName)}--group__${groupName}`;
  }

  renderToC(section, schemaByName, groupNames) {
    return (
      <Anchor>
        {groupNames.map(groupName => (
          <Link
            href={`#${this.generateGroupAnchorId(groupName)}`}
            key={groupName}
            title={<b>{groupName}</b>}
          >
            {section.items
              .filter(item => schemaByName[item.name].group === groupName)
              .map(item => (
                <Link
                  href={`#${this.generateFieldId(section, item)}`}
                  key={item.name}
                  title={item.name}
                />
              ))}
          </Link>
        ))}
      </Anchor>
    );
  }

  renderSectionTab(section, schemaByName) {
    const groupNames = [...new Set(Object.values(schemaByName).map(x => x.group))];
    return (
      <TabPane
        key={section.section}
        tab={
          <span>
            <Icon type={this.getScopeIcon(section.section)} />
            {section.section}
          </span>
        }
      >
        <Row gutter={16}>
          <Col span={6}>{this.renderToC(section, schemaByName, groupNames)}</Col>
          <Col span={18}>
            <Form layout="vertical">
              {groupNames.map(groupName => (
                <div key={groupName}>
                  <h2 id={this.generateGroupAnchorId(groupName)}>{groupName}</h2>
                  {section.items
                    .filter(item => schemaByName[item.name].group === groupName)
                    .map(item => this.renderFormItem(section, item, schemaByName))}
                </div>
              ))}
            </Form>
          </Col>
        </Row>
      </TabPane>
    );
  }

  generateIndexedSchema(schema) {
    const result = Object.fromEntries(SECTIONS.map(name => [name, {}]));
    for (const item of schema) {
      result[item.scope][item.name] = item;
    }
    return result;
  }
  render() {
    if (!this.props.schema || !this.props.config) {
      return this.renderLoader();
    }

    const schemaByScopeAndName = this.generateIndexedSchema(this.props.schema);

    const newSectionMenu = (
      <Menu onClick={::this.handleNewSectionMenuClick}>
        <Menu.Item key={SECTION_PLATFORMIO} title='PlatformIO Core options'>[platformio]</Menu.Item>
        <Menu.Item key={SECTION_GLOBAL_ENV} title='Every "User [env:***]" section automatically extends "Global [env]" options'>Global [env]</Menu.Item>
        <Menu.Item key={SECTION_USER_ENV}>User [env:***]</Menu.Item>
        <Menu.Item key={SECTION_CUSTOM}>Custom section</Menu.Item>
      </Menu>
    );

    const addBtn = (
      <Dropdown overlay={newSectionMenu}>
        <Button icon="plus">
          Section <Icon type="down" />
        </Button>
      </Dropdown>
    );
    return (
      <div className="project-settings-page">
        <h1>{this.props.project.name}</h1>
        <div className="block">
          <Search
            placeholder="Search settings"
            onSearch={::this.handleSearch}
            style={{ width: '100%' }}
          />
        </div>
        <Tabs
          hideAdd
          defaultActiveKey={SECTION_PLATFORMIO}
          type="editable-card"
          tabBarExtraContent={addBtn}
        >
          {this.props.config.map(section =>
            this.renderSectionTab(
              section,
              schemaByScopeAndName[this.getSectionScope(section.section)]
            )
          )}
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
  loadProjectConfig
};

const ConnectedProjectSettingsFormComponent = connect(
  mapStateToProps,
  dispatchToProps
)(ProjectSettingsFormComponent);

export const ProjectSettingsPage = Form.create()(ConnectedProjectSettingsFormComponent);
