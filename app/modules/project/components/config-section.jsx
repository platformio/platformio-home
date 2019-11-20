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
import { getDocumentationUrl } from '@project/helpers';

// Feature flag
const FEATURE_RESET_LINK = false;

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
    form: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    initialValues: PropTypes.arrayOf(ConfigOptionType),
    name: PropTypes.string.isRequired,
    schema: SchemaType.isRequired,
    search: PropTypes.string,
    showToc: PropTypes.bool,
    type: PropTypes.oneOf(SECTIONS).isRequired,
    // callbacks
    onChange: PropTypes.func.isRequired,
    onDocumentationClick: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onTocToggle: PropTypes.func.isRequired,
    onOptionRemove: PropTypes.func.isRequired,
    onShowManageOptions: PropTypes.func.isRequired
  };

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

  handleResetLinkClick = e => {
    e.preventDefault();
    const { name } = e.target.closest('a').dataset;
    const schema = this.props.schema.find(s => s.name === name);
    const value = this.transformIntoFormValue(schema.default, schema);
    const id = this.generateFieldId(name);

    // TODO: doesn't work since we use defaultValue to improve performance
    this.props.form.setFieldsValue({
      [id]: value
    });
  };

  handleToggleTocClick = () => {
    this.props.onTocToggle(!this.props.showToc);
  };

  handleShowManageOptionsClick = () => {
    this.props.onShowManageOptions(this.props.name);
  };

  handleRemoveOptionClick = e => {
    this.props.onOptionRemove(this.props.name, e.target.closest('a').dataset.name);
  };

  renderEmptyMessage(fields, filteredFields) {
    if (!this.props.search && fields.length === 0) {
      return (
        <ul className="background-message">
          <li>No options defined!</li>
        </ul>
      );
    }

    if (this.props.search && filteredFields.length === 0) {
      return (
        <ul className="background-message">
          <li>No matched options found</li>
        </ul>
      );
    }
  }

  renderDocLink(scope, group, name) {
    if (name.startsWith('__')) {
      return;
    }
  }

  renderLabel(name, schema, { multiple, valueOverridden }) {
    let label = schema && schema.label ? schema.label : name;

    label = (
      <React.Fragment>
        <div className="option-actions">
          {schema && (
            <DocumentationLink
              url={getDocumentationUrl(schema.scope, schema.group, name)}
              onClick={this.handleDocumentationClick}
            />
          )}
          <Tooltip placement="right" title="Remove Option">
            <a
              className="remove-option-btn"
              data-name={name}
              onClick={this.handleRemoveOptionClick}
            >
              <Icon type="delete" />
            </a>
          </Tooltip>
        </div>

        {label}
      </React.Fragment>
    );

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

    if (FEATURE_RESET_LINK && valueOverridden && schema) {
      label = (
        <React.Fragment>
          {label}{' '}
          <Tooltip
            title={`Reset to default ${
              schema.default != undefined && schema.default.toString().length
                ? `"${schema.default}"`
                : '"" (empty string)'
            }`}
          >
            <a data-name={name} onClick={this.handleResetLinkClick}>
              Reset
            </a>
          </Tooltip>
        </React.Fragment>
      );
    }

    return label;
  }

  renderFormItem(name, schemaByName, initialValue, hidden) {
    const schema = schemaByName[name];
    const type = schema ? schema.type : TYPE_TEXT;
    const multiple = !schema || schema.multiple;
    const description = schema ? schema.description : undefined;

    const defaultValue = schema
      ? this.transformIntoFormValue(schema.default, schema)
      : undefined;
    const id = this.generateFieldId(name);
    const formValue = this.props.form.getFieldValue(id);
    const valueOverridden =
      schema && formValue != undefined && formValue !== '' && formValue != defaultValue;

    const decoratorOptions = {
      trigger: 'onBlur',
      validateTrigger: false,
      valuePropName: 'defaultValue',
      initialValue
    };

    const label = this.renderLabel(name, schema, { multiple, valueOverridden });

    const itemProps = {
      className: '',
      help: description,
      key: name,
      label,
      labelCol: {
        id: this.generateFieldLabelId(name)
      }
    };
    if (valueOverridden) {
      itemProps.className += ' value-overridden';
    }
    if (hidden) {
      itemProps.className += ' hide';
    }

    let input;
    switch (type) {
      case TYPE_BOOL:
        input = <Checkbox>{description}</Checkbox>;
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
              placeholder={defaultValue}
              autoSize={{ minRows: 1, maxRows: 20 }}
              rows={1}
            />
          );
        } else {
          input = (
            <Input placeholder={defaultValue} readOnly={schema && schema.readonly} />
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

  renderSectionName() {
    return (
      <React.Fragment>
        <h2 className="config-section-group" id={this.generateGroupAnchorId('Section')}>
          <div className="block">
            <Tooltip title="Toggle Table of Contents">
              <Button size="small" onClick={this.handleToggleTocClick}>
                <Icon type={this.props.showToc ? 'menu-fold' : 'menu-unfold'} />
              </Button>
            </Tooltip>
            {this.props.type !== SECTION_CUSTOM && (
              <React.Fragment>
                {' '}
                <Tooltip title="Manage Options">
                  <Button
                    size="small"
                    onClick={this.handleShowManageOptionsClick}
                    type="primary"
                  >
                    <Icon type="form" /> Manage Options
                  </Button>
                </Tooltip>
              </React.Fragment>
            )}
          </div>
          <ConfigFormItem key={SECTION_NAME_KEY} label="Section Name">
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
          </ConfigFormItem>
        </h2>
      </React.Fragment>
    );
  }

  renderGroup(groupName, fields, schema, values) {
    const groupHidden = fields.length && fields.every(x => x.hidden);
    return (
      <div key={groupName} className={groupHidden ? 'hide' : undefined}>
        {groupName.length !== 0 && (
          <h2
            className="config-section-group"
            id={this.generateGroupAnchorId(groupName)}
          >
            {groupName} Options
          </h2>
        )}
        {fields.map(({ name, hidden }) =>
          this.renderFormItem(name, schema, values[name], hidden)
        )}
      </div>
    );
  }

  render() {
    const schema = this.generateIndexedSchema();
    const fields = this.props.initialValues.map(({ name }) => name);

    const searchFilter = name =>
      name.includes(this.props.search) ||
      (schema[name] &&
        schema[name].description &&
        schema[name].description
          .toLowerCase()
          .includes(this.props.search.toLowerCase()));

    const filteredFields = this.props.search ? fields.filter(searchFilter) : fields;
    const filteredFieldsSet = new Set(filteredFields);

    const groups = new Set();
    const fieldsByGroup = [];
    fields.forEach(name => {
      const group = schema[name] ? schema[name].group : 'Custom';
      if (!groups.has(group)) {
        groups.add(group);
        fieldsByGroup[group] = [];
      }
      fieldsByGroup[group].push({ name, hidden: !filteredFieldsSet.has(name) });
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
              fields={filteredFields}
              schema={this.props.schema}
              onCreateId={this.handleCreateTocId}
            />
          </Col>
        )}
        <Col key="main" {...mainColProps}>
          <Form layout="vertical" className="config-form">
            {!this.props.search && this.renderSectionName()}
            {this.renderEmptyMessage(fields, filteredFields)}
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
