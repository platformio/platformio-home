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
  Button,
  Checkbox,
  Col,
  Form,
  Icon,
  Input,
  Modal,
  Row,
  Select,
  Tag,
  Tooltip
} from 'antd';
import { ConfigOptionType, SchemaType } from '@project/types';
import {
  SECTIONS,
  SECTION_CUSTOM,
  SECTION_GLOBAL_ENV,
  SECTION_NAME_KEY,
  SECTION_PLATFORMIO,
  SECTION_USER_ENV,
  TYPE_BOOL,
  TYPE_CHOICE,
  TYPE_FILE,
  TYPE_INT,
  TYPE_INT_RANGE,
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

function splitMultipleField(v) {
  if (v == undefined) {
    return;
  }
  return v.split(/[,\n]/).filter((v, i) => v.length || i);
}

class ConfigSectionComponent extends React.PureComponent {
  static propTypes = {
    // data
    autoFocus: PropTypes.string,
    form: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    initialValues: PropTypes.arrayOf(ConfigOptionType),
    name: PropTypes.string.isRequired,
    schema: SchemaType.isRequired,
    showToc: PropTypes.bool,
    type: PropTypes.oneOf(SECTIONS).isRequired,
    // callbacks
    onChange: PropTypes.func.isRequired,
    onDocumentationClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onTocToggle: PropTypes.func.isRequired,
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
    if (rawValue == undefined) {
      return;
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

  handleToggleTocClick = () => {
    this.props.onTocToggle(!this.props.showToc);
  };

  handleRemoveOptionClick = e => {
    this.props.onOptionRemove(this.props.name, e.target.closest('a').dataset.name);
  };

  handleNewOptionSelect = name => {
    this.props.onOptionAdd(this.props.name, name);
  };

  handleRemoveClick = () => {
    Modal.confirm({
      autoFocusButton: 'cancel',
      content: (
        <p>
          Press &ldquo;Remove&rdquo; to remove without possibility to restore
          <br />
          Press &ldquo;Cancel&rdquo; to continue editing without removing
        </p>
      ),
      onOk: () => {
        this.props.onRemove(this.props.name);
      },
      okText: 'Remove',
      okType: 'danger',
      title: 'Do you really want to remove configuration?',
      type: 'error'
    });
  };

  blockSubmit = e => {
    e.preventDefault();
  };

  renderEmptyMessage(fields) {
    if (fields.length === 0) {
      return (
        <ul className="background-message option-like">
          <li>No options defined!</li>
        </ul>
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
            />
          )}
          <Tooltip title="Remove Option">
            <a
              className="remove-option-btn"
              data-name={name}
              onClick={this.handleRemoveOptionClick}
            >
              <Icon type="delete" />
            </a>
          </Tooltip>
        </span>
      </React.Fragment>
    );

    return label;
  }

  renderFormItem(name, schemaByName, initialValue) {
    const schema = schemaByName[name];
    const type = schema ? schema.type : TYPE_TEXT;
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

    let input;
    switch (type) {
      case TYPE_BOOL:
        input = <Checkbox autoFocus={autoFocus}>{description}</Checkbox>;
        decoratorOptions.valuePropName = 'defaultChecked';
        decoratorOptions.trigger = 'onChange';
        itemProps.help = undefined;

        if (initialValue === undefined) {
          decoratorOptions.initialValue = defaultValue;
        }
        break;

      case TYPE_CHOICE:
        input = (
          <Select
            autoFocus={autoFocus}
            placeholder={defaultValue}
            mode={multiple ? 'multiple' : 'default'}
            tokenSeparators={[',', '\n']}
          >
            {schema.choices.map(value => (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
        );
        break;

      case TYPE_TEXT:
      case TYPE_FILE:
      case TYPE_INT:
      case TYPE_INT_RANGE:
      default:
        if (multiple) {
          input = (
            <Input.TextArea
              autoFocus={autoFocus}
              placeholder={defaultValue}
              autoSize={{ minRows: 1, maxRows: 20 }}
              rows={1}
            />
          );
        } else {
          input = (
            <Input
              autoFocus={autoFocus}
              placeholder={defaultValue}
              readOnly={schema && schema.readonly}
            />
          );
        }
        if (!type) {
          console.warn(`Unsupported item type: "${type}" for name: "${name}"`);
          // throw new Error(`Unsupported item type: "${type}"`);
        }
        break;
    }

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
            {items.map(schema => (
              <Select.Option key={schema.name} value={schema.name}>
                {schema.name}
                {schema.description && (
                  <div className="option-description">{schema.description}</div>
                )}
              </Select.Option>
            ))}
          </Select.OptGroup>
        ))}
      </Select>
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
          Configuration{' '}
          <Tooltip title="Toggle Table of Contents">
            <Button size="small" onClick={this.handleToggleTocClick}>
              <Icon type={this.props.showToc ? 'menu-fold' : 'menu-unfold'} />
            </Button>
          </Tooltip>
        </h2>
        <Form
          className="config-section-configuration"
          layout="horizontal"
          labelAlign="left"
          onSubmit={this.blockSubmit}
        >
          <Form.Item key={SECTION_NAME_KEY} label="Name" {...itemLayout}>
            <Input
              addonBefore={
                this.props.type === SECTION_USER_ENV ? SECTION_USER_ENV : undefined
              }
              defaultValue={this.props.name.replace(SECTION_USER_ENV, '')}
              readOnly={
                this.props.type === SECTION_PLATFORMIO ||
                this.props.type === SECTION_GLOBAL_ENV
              }
              onChange={this.handleRename}
            />
          </Form.Item>
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
          <Button onClick={this.handleRemoveClick} type="danger">
            Remove Configuration
          </Button>
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
          if (fieldSchema && fieldSchema.multiple && fieldSchema.type === TYPE_TEXT) {
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
