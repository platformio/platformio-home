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
  Checkbox,
  Col,
  Form,
  Icon,
  Input,
  InputNumber,
  Row,
  Select,
  Tag,
  Tooltip
} from 'antd';
import { ConfigOptionType, SchemaType } from '@project/types';
import {
  SCOPE_PLATFORMIO,
  SECTIONS,
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
    // fields: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
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
    onRename: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    this.setFormValuesFromProps();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.initialValues !== prevProps.initialValues ||
      this.props.showOverridden !== prevProps.showOverridden ||
      this.props.search !== prevProps.search
    ) {
      this.setFormValuesFromProps();
    }
  }

  setFormValuesFromProps() {
    this.setFormValuesFromData(
      Object.fromEntries(
        this.props.initialValues.map(({ name, value }) => [name, value])
      )
    );
  }

  generateIndexedSchema() {
    // Object.fromEntries(
    //   [SECTION_PLATFORMIO, SECTION_GLOBAL_ENV, SECTION_USER_ENV, SECTION_CUSTOM].map(
    //     name => [name, {}]
    //   )
    // );
    // result = Object.fromEntries(
    //   [SECTION_PLATFORMIO, SECTION_GLOBAL_ENV, SECTION_USER_ENV, SECTION_CUSTOM].map(
    //     name => [
    //       name,
    //       {
    //         [SECTION_NAME_KEY]: {
    //           name: SECTION_NAME_KEY,
    //           displayName: 'name',
    //           multiple: false,
    //           type: TYPE_TEXT,
    //           label: 'Section Name',
    //           group: 'Section',
    //           readonly: [SECTION_PLATFORMIO, SECTION_GLOBAL_ENV].includes(name)
    //         }
    //       }
    //     ]
    //   )
    // );
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

    return Object.entries(values)
      .filter(item => item[1] !== undefined)
      .map(([name, rawValue]) => {
        return {
          name: unescapeFieldName(name),
          value: this.transformFormValue(rawValue, schema[name])
        };
      });
  }

  setFormValuesFromData(rawValues) {
    // set form values
    const sectionSchema = this.generateIndexedSchema();
    const values = {};
    for (const [name, rawValue] of Object.entries(rawValues)) {
      const fieldName = this.generateFieldId(name);
      let value;

      if (!sectionSchema[name]) {
        // Custom field
        if (typeof rawValue === 'string') {
          value = splitMultipleField(rawValue).join('\n');
        } else if (Array.isArray(rawValue)) {
          value = rawValue.join('\n');
        }
      } else {
        const schema = sectionSchema[name];
        if (schema.multiple && typeof rawValue === 'string') {
          value = splitMultipleField(rawValue);
        } else {
          value = rawValue;
        }
        if (schema.type === TYPE_TEXT && schema.multiple) {
          value = value.join('\n');
        }
      }
      values[fieldName] = value;
    }

    this.props.form.setFieldsValue(values);
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

  renderEmptySection() {
    return (
      <ul className="background-message text-center">
        <li>No options defined!</li>
      </ul>
    );
  }

  renderNoFilteredItems() {
    return (
      <ul className="background-message text-center">
        <li>No Results</li>
      </ul>
    );
  }

  renderDocLink(scope, group, name) {
    if (name.startsWith('__')) {
      return;
    }
  }

  renderLabel(name, schema, multiple) {
    let label = schema && schema.label ? schema.label : name;

    label = (
      <React.Fragment>
        {schema && (
          <DocumentationLink
            url={getDocumentationUrl(schema.scope, schema.group, name)}
            onClick={this.handleDocumentationClick}
          />
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
    return label;
  }

  renderFormItem(name, schemaByName) {
    const schema = schemaByName[name];
    const type = schema ? schema.type : TYPE_TEXT;
    const multiple = !schema || schema.multiple;
    const description = schema ? schema.description : undefined;
    const decoratorOptions = {
      validateTrigger: false
    };
    const label = this.renderLabel(name, schema, multiple);

    let input;
    switch (type) {
      case TYPE_BOOL:
        input = <Checkbox>{description}</Checkbox>;
        decoratorOptions.valuePropName = 'checked';
        break;

      case TYPE_INT:
        input = <InputNumber />;
        break;

      case TYPE_INT_RANGE:
        // inputProps.defaultValue = schema.default
        input = <InputNumber min={schema.min} max={schema.max} />;
        break;

      case TYPE_CHOICE:
        input = (
          <Select
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
      default:
        if (multiple) {
          input = <Input.TextArea autoSize={{ minRows: 1, maxRows: 20 }} rows={1} />;
        } else {
          input = <Input readOnly={schema && schema.readonly} />;
        }
        if (!type) {
          console.warn(`Unsupported item type: "${type}" for name: "${name}"`);
          // throw new Error(`Unsupported item type: "${type}"`);
        }
        break;
    }

    const itemProps = {
      key: name,
      label,
      labelCol: {
        id: this.generateFieldLabelId(name)
      }
    };

    if (type !== TYPE_BOOL) {
      itemProps.help = description;
    }

    const wrappedInput = this.props.form.getFieldDecorator(
      this.generateFieldId(name),
      decoratorOptions
    )(input);

    return <ConfigFormItem {...itemProps}>{wrappedInput}</ConfigFormItem>;
  }

  renderName() {
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

    if (!fields.length) {
      return this.renderEmptySection();
    }
    const searchFilter = name =>
      this.props.search === undefined || name.includes(this.props.search);

    const filteredFields = fields.filter(searchFilter);
    if (!filteredFields.length) {
      return this.renderNoFilteredItems();
    }

    const groups = new Set();
    const fieldsByGroup = [];
    filteredFields.forEach(name => {
      const group = schema[name] ? schema[name].group : 'Custom';
      if (!groups.has(group)) {
        groups.add(group);
        fieldsByGroup[group] = [];
      }
      fieldsByGroup[group].push(name);
    });

    return (
      <Row gutter={0}>
        <Col xs={24} sm={9} md={6}>
          <ConfigSectionToc
            fields={filteredFields}
            schema={schema}
            onCreateId={this.handleCreateTocId}
          />
        </Col>
        <Col xs={24} sm={15} md={18}>
          <Form layout="vertical" className="config-form">
            {this.renderName()}
            {[...groups].map(groupName => (
              <div key={groupName}>
                {groupName.length !== 0 && (
                  <h2
                    className="config-section-group"
                    id={this.generateGroupAnchorId(groupName)}
                  >
                    {groupName} Options
                  </h2>
                )}
                {fieldsByGroup[groupName].map(name =>
                  this.renderFormItem(name, schema)
                )}
              </div>
            ))}
          </Form>
        </Col>
      </Row>
    );
  }
}

export const ConfigSectionForm = Form.create()(ConfigSectionComponent);
