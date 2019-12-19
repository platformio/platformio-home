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

// Force dependency
import '@project/components/env-autocomplete';
import '@project/containers/board-autocomplete';
import '@project/containers/framework-autocomplete';
import '@project/containers/libdeps-autocomplete';
import '@project/containers/platform-autocomplete';
import '@project/containers/port-autocomplete';

import {
  Button,
  Col,
  Form,
  Icon,
  Input,
  Popconfirm,
  Row,
  Select,
  Tag,
  Tooltip
} from 'antd';
import { ConfigOptionType, ProjectType, SchemaType } from '@project/types';
import { OptionEditorFactory, splitMultipleField } from '@project/helpers';
import {
  SECTIONS,
  SECTION_CUSTOM,
  SECTION_GLOBAL_ENV,
  SECTION_NAME_KEY,
  SECTION_PLATFORMIO,
  SECTION_USER_ENV,
  TYPE_TEXT
} from '@project/constants';

import { ConfigFormItem } from '@project/components/config-form-item';
import { ConfigSectionToc } from '@project/components/config-section-toc';
import { DocumentationLink } from '@project/components/documentation-link';
import { IS_WINDOWS } from '@app/config';
import PropTypes from 'prop-types';
import React from 'react';

function escapeFieldName(x) {
  return x.replace(/\./g, '@');
}

function unescapeFieldName(x) {
  return x.replace(/@/g, '.');
}

function formatEnvVar(name) {
  return IS_WINDOWS ? `%${name}%` : `$${name}`;
}

class ConfigSectionComponent extends React.PureComponent {
  static propTypes = {
    // data
    autoFocus: PropTypes.string,
    defaultEnv: PropTypes.bool,
    form: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    initialValues: PropTypes.arrayOf(ConfigOptionType),
    name: PropTypes.string.isRequired,
    project: ProjectType.isRequired,
    schema: SchemaType.isRequired,
    showToc: PropTypes.bool,
    title: PropTypes.string.isRequired,
    type: PropTypes.oneOf(SECTIONS).isRequired,
    // callbacks
    onChange: PropTypes.func.isRequired,
    onDefaultToggle: PropTypes.func.isRequired,
    onDocumentationClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onOptionAdd: PropTypes.func.isRequired,
    onOptionRemove: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  generateIndexedSchema() {
    const result = {};
    for (const item of this.props.schema) {
      result[item.name] = item;
    }
    return result;
  }

  generateFieldId(name) {
    return `${escapeFieldName(this.props.id)}.${escapeFieldName(name)}`;
  }

  generateFieldLabelId(name) {
    return `${this.props.id}-f-${name}`;
  }

  generateGroupAnchorId(groupName) {
    return `${this.props.id}-g-${groupName}`;
  }

  transformIntoFormValues(initialValues, transformName) {
    const sectionSchema = this.generateIndexedSchema();
    const values = {};

    for (const { name, value: rawValue } of initialValues) {
      const fieldName = transformName ? this.generateFieldId(name) : name;
      values[fieldName] = this.transformIntoFormValue(rawValue, sectionSchema[name]);
    }
    return values;
  }

  transformIntoFormValue(rawValue, schema) {
    if (rawValue == undefined || OptionEditorFactory.isCustomized(schema)) {
      return rawValue;
    }

    let value;
    if (!schema) {
      // Custom field
      if (typeof rawValue === 'string') {
        value = splitMultipleField(rawValue).join('\n');
      } else if (Array.isArray(rawValue)) {
        value = rawValue.join('\n');
      } else {
        value = rawValue;
        console.error('Unsupported custom field type', { schema, rawValue });
      }
    } else {
      if (schema.multiple && typeof rawValue === 'string') {
        value = splitMultipleField(rawValue);
      } else {
        value = rawValue;
      }
      if (schema.type === TYPE_TEXT && schema.multiple) {
        value = value.join('\n');
      }
    }
    return value;
  }

  setFormValuesFromData(initialValues) {
    this.props.form.setFieldsValue(this.transformIntoFormValues(initialValues, true));
  }

  handleCreateTocId = (type, name) => {
    if (type === 'group') {
      return this.generateGroupAnchorId(name);
    } else {
      return this.generateFieldLabelId(name);
    }
  };

  handleDocumentationClick = url => {
    this.props.onDocumentationClick(url);
  };

  handleRename = e => {
    let name = e.target.value;
    if (this.props.type === SECTION_USER_ENV) {
      name = SECTION_USER_ENV + name;
    }
    this.props.onRename(name, this.props.id);
  };

  handleRemoveOptionClick = e => {
    this.props.onOptionRemove(this.props.name, e.target.closest('a').dataset.name);
  };

  handleNewOptionSelect = name => {
    this.props.onOptionAdd(this.props.name, name);
  };

  handleRemoveClick = () => {
    this.props.onRemove(this.props.name, this.props.id);
  };

  handleToggleMakeDefaultClick = () => {
    this.props.onDefaultToggle(this.props.name, !this.props.defaultEnv);
  };

  blockSubmit = e => {
    e.preventDefault();
  };

  renderEmptyMessage(fields) {
    if (fields.length === 0) {
      return (
        <div className="text-center">
          <br />
          <h1>
            No options <br />
            <small>Use &quot;New Option&quot; above to add a new one</small>
          </h1>
        </div>
      );
    }
  }

  renderLabel(name, schema, { multiple }) {
    let label = schema && schema.label ? schema.label : name;

    label = <React.Fragment>{label}</React.Fragment>;

    if (multiple) {
      label = (
        <React.Fragment>
          {label}{' '}
          <Tooltip title="Option accepts multiple arguments separated by new line">
            <Tag className="multiline" size="small">
              ML
            </Tag>
          </Tooltip>
        </React.Fragment>
      );
    }

    if (schema && schema.sysenvvar) {
      label = (
        <React.Fragment>
          {label}{' '}
          <Tooltip
            title={
              <React.Fragment>
                Option can be configured by a global{' '}
                <code>{formatEnvVar(schema.sysenvvar)}</code> environment variable
              </React.Fragment>
            }
          >
            <Tag className="sysenvvar">ENV</Tag>
          </Tooltip>
        </React.Fragment>
      );
    }

    label = (
      <React.Fragment>
        {label}
        <span className="option-actions">
          {schema && (
            <DocumentationLink
              group={schema.group}
              name={name}
              scope={schema.scope}
              onClick={this.handleDocumentationClick}
            >
              Docs
            </DocumentationLink>
          )}
          <Tooltip title="Remove Option">
            <a
              className="remove-option-btn"
              data-name={name}
              onClick={this.handleRemoveOptionClick}
            >
              <Icon type="delete" /> Delete
            </a>
          </Tooltip>
        </span>
      </React.Fragment>
    );

    return label;
  }

  renderFormItem(name, schemaByName, initialValue) {
    const schema = schemaByName[name];
    const multiple = !schema || schema.multiple;
    const description = schema ? schema.description : undefined;

    const defaultValue = schema
      ? this.transformIntoFormValue(schema.default, schema)
      : undefined;
    const id = this.generateFieldId(name);
    const autoFocus = this.props.autoFocus === name;

    const decoratorOptions = {
      trigger: 'onBlur',
      validateTrigger: false,
      valuePropName: 'defaultValue',
      initialValue
    };

    const label = this.renderLabel(name, schema, { multiple });
    const itemProps = {
      className: '',
      help: description,
      key: name,
      label,
      labelCol: {
        id: this.generateFieldLabelId(name)
      }
    };

    const inputProps = {
      autoFocus,
      defaultValue,
      configSectionData: this.props.initialValues
    };
    const input = OptionEditorFactory.factory(
      schema,
      inputProps,
      itemProps,
      decoratorOptions,
      this.props.project
    );

    const wrappedInput = this.props.form.getFieldDecorator(id, decoratorOptions)(input);
    return <ConfigFormItem {...itemProps}>{wrappedInput}</ConfigFormItem>;
  }

  getNewOptionsData(group) {
    const alreadyAdded = new Set(this.props.initialValues.map(option => option.name));
    const result = new Map();
    this.props.schema.forEach(schema => {
      if ((group && schema.group !== group) || alreadyAdded.has(schema.name)) {
        return;
      }

      if (!result.has(schema.group)) {
        result.set(schema.group, []);
      }
      result.get(schema.group).push(schema);
    });
    return result;
  }

  renderNewOption() {
    const ds = this.getNewOptionsData();
    return (
      <Select
        className="select-add-new-option"
        dropdownClassName="dropdown-add-new-option"
        showSearch
        style={{ width: '100%' }}
        // size="large"
        placeholder="Click to start searching available options"
        filterOption={(input, option) =>
          option.key.toLowerCase().includes(input.toLowerCase())
        }
        onSelect={this.handleNewOptionSelect}
        value={undefined}
      >
        {[...ds].map(([group, items]) => (
          <Select.OptGroup
            key={group}
            label={`${group.substr(0, 1).toUpperCase()}${group.substr(1)} Options`}
          >
            {items.map(schema => {
              const lines = [];
              if (schema.description) {
                lines.push(schema.description);
              }
              if (schema.default != undefined) {
                lines.push(
                  `Default is "${this.transformIntoFormValue(schema.default, schema)}"`
                );
              }
              return (
                <Select.Option key={schema.name} value={schema.name}>
                  {schema.name}
                  {lines.length !== 0 && (
                    <div className="option-description">{lines.join('. ')}</div>
                  )}
                </Select.Option>
              );
            })}
          </Select.OptGroup>
        ))}
      </Select>
    );
  }

  renderSectionActions() {
    return (
      <span className="pull-right inline-buttons">
        {this.props.type === SECTION_USER_ENV && (
          <Tooltip title="Default configuration for building, uploading, debugging, etc">
            <Button
              icon="environment"
              size="small"
              onClick={this.handleToggleMakeDefaultClick}
            >
              {this.props.defaultEnv ? 'Remove From Default' : 'Make Default'}
            </Button>
          </Tooltip>
        )}
        <Popconfirm
          title="Are you sure?"
          okText="Yes"
          okType="danger"
          cancelText="No"
          onConfirm={this.handleRemoveClick}
        >
          <Button icon="delete" size="small">
            Delete
          </Button>
        </Popconfirm>
      </span>
    );
  }

  renderSectionName() {
    const itemLayout = {
      labelCol: { xs: 24, sm: 5, md: 4, lg: 3 },
      wrapperCol: { xs: 24, sm: 19, md: 20, lg: 21 }
    };
    return (
      <React.Fragment>
        <h2>
          {this.props.title}
          {this.renderSectionActions()}
        </h2>
        <Form
          className="config-section-configuration"
          layout="horizontal"
          labelAlign="left"
          onSubmit={this.blockSubmit}
        >
          {this.props.type !== SECTION_PLATFORMIO &&
            this.props.type !== SECTION_GLOBAL_ENV && (
              <Form.Item key={SECTION_NAME_KEY} label="Name" {...itemLayout}>
                <Input
                  addonBefore={
                    this.props.type === SECTION_USER_ENV ? SECTION_USER_ENV : undefined
                  }
                  defaultValue={this.props.name.replace(SECTION_USER_ENV, '')}
                  onChange={this.handleRename}
                />
              </Form.Item>
            )}
          {this.props.type !== SECTION_CUSTOM && (
            <Form.Item key="add_option" label="New Option" {...itemLayout}>
              {this.renderNewOption()}
            </Form.Item>
          )}
        </Form>
      </React.Fragment>
    );
  }

  renderGroup(groupName, fields, schema, values) {
    return (
      <div key={groupName} className="config-section-group">
        {groupName.length !== 0 && (
          <h2 id={this.generateGroupAnchorId(groupName)}>{groupName} Options</h2>
        )}
        {fields.map(({ name }) => this.renderFormItem(name, schema, values[name]))}
      </div>
    );
  }

  render() {
    const schema = this.generateIndexedSchema();
    const fields = this.props.initialValues.map(({ name }) => name);
    const groups = new Set();
    const fieldsByGroup = [];
    fields.forEach(name => {
      const group = schema[name] ? schema[name].group : 'Custom';
      if (!groups.has(group)) {
        groups.add(group);
        fieldsByGroup[group] = [];
      }
      fieldsByGroup[group].push({ name });
    });

    const values = this.transformIntoFormValues(this.props.initialValues);
    const mainColProps = this.props.showToc
      ? {
          xs: 24,
          xm: 15,
          md: 18
        }
      : {
          span: 24
        };
    return (
      <Row gutter={0}>
        {this.props.showToc && (
          <Col key="toc" xs={24} sm={9} md={6}>
            <ConfigSectionToc
              fields={fields}
              schema={this.props.schema}
              onCreateId={this.handleCreateTocId}
            />
          </Col>
        )}
        <Col key="main" {...mainColProps}>
          {this.renderSectionName()}
          <Form layout="vertical" className="config-form">
            {this.renderEmptyMessage(fields)}
            {fields.length !== 0 &&
              [...groups].map(groupName =>
                this.renderGroup(groupName, fieldsByGroup[groupName], schema, values)
              )}
          </Form>
        </Col>
      </Row>
    );
  }
}

export const ConfigSectionForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(
      props.name,
      Object.fromEntries(
        Object.entries(changedFields[props.id]).map(([escapedName, field]) => {
          const name = unescapeFieldName(escapedName);
          let value = field.value;
          const fieldSchema = props.schema.find(s => s.name === name);
          if (
            fieldSchema &&
            fieldSchema.multiple &&
            fieldSchema.type === TYPE_TEXT &&
            !OptionEditorFactory.isCustomized(fieldSchema)
          ) {
            value = splitMultipleField(field.value);
          }
          return [
            name,
            {
              ...field,
              value
            }
          ];
        })
      )
    );
  },
  mapPropsToFields(props) {
    // TODO: load "dirty", "touched", "name" field state
    const result = Object.fromEntries(
      props.initialValues.map(option => [
        escapeFieldName(option.name),
        Form.createFormField({ value: option.value })
      ])
    );
    return result;
  }
})(ConfigSectionComponent);
