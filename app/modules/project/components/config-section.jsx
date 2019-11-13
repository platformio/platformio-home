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
  SCOPE_PLATFORMIO,
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
import { IS_WINDOWS } from '@app/config';
import PropTypes from 'prop-types';
import React from 'react';

// Feature flag
const FEATURE_RESET_LINK = false;

const ADD_NEW_OPTION_KEY = 'add-new-option';

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

function getDocumentationUrl(scope, group, name) {
  const pageParts = [scope];
  if (scope !== SCOPE_PLATFORMIO) {
    pageParts.push(group);
  }
  const page = `section_${pageParts.join('_')}.html`;
  const hash =
    name !== undefined
      ? name.replace(/[^a-z]/g, '-')
      : `${group.toLowerCase()}-options`;

  return `https://docs.platformio.org/en/latest/projectconf/${encodeURIComponent(
    page
  )}#${encodeURIComponent(hash)}`;
}

class DocumentationLink extends React.PureComponent {
  static propTypes = {
    // data
    url: PropTypes.string.isRequired,
    // callbacks
    onClick: PropTypes.func.isRequired
  };

  handleClick = e => {
    e.preventDefault();
    this.props.onClick(this.props.url);
  };

  render() {
    return (
      <div className="documentation-link">
        <a onClick={this.handleClick} title={this.props.url}>
          <Icon type="question-circle" />
        </a>
      </div>
    );
  }
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
    showOverridden: PropTypes.bool,
    type: PropTypes.oneOf(SECTIONS).isRequired,
    // callbacks
    onDocumentationClick: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onFieldAdd: PropTypes.func.isRequired,
    onFieldRemove: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {
      autoFocus: ADD_NEW_OPTION_KEY
    };
  }

  componentDidMount() {
    this.setFormValuesFromProps();
  }

  componentDidUpdate(prevProps) {
    if (this.props.initialValues !== prevProps.initialValues) {
      this.setFormValuesFromProps();
    }
  }

  setFormValuesFromProps() {
    this.setFormValuesFromData(this.props.initialValues);
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

  transformFormValue(rawValue, fieldSchema) {
    let value = rawValue;
    if (fieldSchema && fieldSchema.multiple && fieldSchema.type === TYPE_TEXT) {
      value = splitMultipleField(rawValue);
    }
    return value;
  }

  getValues() {
    // TODO: validate
    // this.props.form.validateFields((err, fieldsValue) => {
    const values = this.props.form.getFieldsValue()[this.props.id] || {};
    const schema = this.generateIndexedSchema();
    const allOptions = Object.entries(values)
      .filter(([, v]) => {
        if (v == undefined) {
          return false;
        }
        if ((typeof v === 'string' || Array.isArray(v)) && !v.length) {
          return false;
        }
        return true;
      })
      .map(([name, rawValue]) => {
        return {
          name: unescapeFieldName(name),
          value: this.transformFormValue(rawValue, schema[name])
        };
      });
    return allOptions;
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

  handleNewRefUpdate = $el => {
    this.$new = $el;
    if (
      this.props.type === SECTION_CUSTOM &&
      this.props.initialValues.length === 0 &&
      this.$new
    ) {
      this.$new.focus();
    }
  };

  handleNewKeydown = e => {
    if (e.defaultPrevented) {
      return; // Should do nothing if the default action has been cancelled
    }
    if (e.keyCode === 13) {
      const name = this.$new.state.value;
      this.setState({ autoFocus: name });
      this.props.onFieldAdd(this.props.name, name);
      this.$new.setState({ value: '' });
      // Suppress "double action" if event handled
      event.preventDefault();
    }
  };

  handleRemoveOptionClick = e => {
    this.props.onFieldRemove(this.props.name, e.target.dataset.name);
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

  renderLabel(name, schema, { multiple, valueOverridden }) {
    let label = schema && schema.label ? schema.label : name;

    label = (
      <React.Fragment>
        {schema && (
          <DocumentationLink
            url={getDocumentationUrl(schema.scope, schema.group, name)}
            onClick={this.handleDocumentationClick}
          />
        )}
        {this.props.type === SECTION_CUSTOM && (
          <Tooltip title="Remove option">
            <Button
              className="remove-option-btn"
              data-name={name}
              icon="delete"
              size="small"
              onClick={this.handleRemoveOptionClick}
            />
          </Tooltip>
        )}
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
              autoFocus={this.state.autoFocus === name}
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
          Section Options
        </h2>
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

  renderNewField() {
    return (
      <div className="add-new-option" key={ADD_NEW_OPTION_KEY}>
        <Icon className="add-icon" type="plus" />
        <Input
          autoFocus={this.state.autoFocus === ADD_NEW_OPTION_KEY}
          onKeyDown={this.handleNewKeydown}
          placeholder="Enter new option name and press enter"
          ref={this.handleNewRefUpdate}
        />
      </div>
    );
  }

  render() {
    const schema = this.generateIndexedSchema();
    const configFields = this.props.initialValues.map(({ name }) => name);
    let fields;

    if (this.props.showOverridden || !Object.keys(schema).length) {
      fields = configFields;
    } else {
      const schemaFields = this.props.schema.map(({ name }) => name);
      fields = [...new Set([...schemaFields, ...configFields])];
    }

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

    if (this.props.type === SECTION_CUSTOM) {
      // Force display group name when there are no fields
      groups.add('Custom');
      fieldsByGroup['Custom'] = [];
    }

    fields.forEach(name => {
      const group = schema[name] ? schema[name].group : 'Custom';
      if (!groups.has(group)) {
        groups.add(group);
        fieldsByGroup[group] = [];
      }
      fieldsByGroup[group].push({ name, hidden: !filteredFieldsSet.has(name) });
    });

    const values = this.transformIntoFormValues(this.props.initialValues);

    return (
      <Row gutter={0}>
        <Col xs={24} sm={9} md={6}>
          <ConfigSectionToc
            fields={filteredFields}
            schema={this.props.schema}
            onCreateId={this.handleCreateTocId}
          />
        </Col>
        <Col xs={24} sm={15} md={18}>
          <Form layout="vertical" className="config-form">
            {!this.props.search && this.renderSectionName()}
            {this.props.type !== SECTION_CUSTOM &&
              this.renderEmptyMessage(fields, filteredFields)}
            {groups.size !== 0 &&
              [...groups].map(groupName =>
                this.renderGroup(groupName, fieldsByGroup[groupName], schema, values)
              )}
          </Form>
          {this.props.type === SECTION_CUSTOM && this.renderNewField()}
        </Col>
      </Row>
    );
  }
}

export const ConfigSectionForm = Form.create()(ConfigSectionComponent);
