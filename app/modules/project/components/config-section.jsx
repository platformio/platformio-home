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
import {
  SCOPE_PLATFORMIO,
  SECTION_NAME_KEY,
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
    fields: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    form: PropTypes.object.isRequired,
    idPrefix: PropTypes.string.isRequired,
    initialValues: PropTypes.object,
    schema: PropTypes.object,
    search: PropTypes.string,
    showOverridden: PropTypes.bool,
    // callbacks
    onDocumentationClick: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    this.setFormValuesFromData(this.props.initialValues);
  }

  componentDidUpdate(prevProps) {
    // TODO: deep value comparision?
    if (this.props.initialValues !== prevProps.initialValues) {
      this.setFormValuesFromData(this.props.initialValues);
    }
  }

  generateFieldId(name) {
    return `${escapeFieldName(this.props.idPrefix)}.${escapeFieldName(name)}`;
  }

  generateFieldLabelId(name) {
    return `${this.props.idPrefix}-f-${name}`;
  }

  generateGroupAnchorId(groupName) {
    return `${this.props.idPrefix}-g-${groupName}`;
  }

  transformFormValue(rawValue, fieldSchema) {
    let value = rawValue;
    if (fieldSchema && fieldSchema.multiple && fieldSchema.type === TYPE_TEXT) {
      value = splitMultipleField(rawValue);
    }
    return value;
  }

  getValues() {
    // this.props.form.validateFields((err, fieldsValue) => {
    const values = this.props.form.getFieldsValue()[this.props.idPrefix];
    return {
      section: values[SECTION_NAME_KEY],
      items: Object.entries(values)
        .filter(item => item[1] !== undefined && item[0] !== SECTION_NAME_KEY)
        .map(([name, rawValue]) => {
          return {
            name: unescapeFieldName(name),
            value: this.transformFormValue(rawValue, this.props.schema[name])
          };
        })
    };
  }

  setFormValuesFromData(rawValues) {
    // set form values
    const values = {};
    // const sectionName = rawValues[SECTION_NAME_KEY];
    // const sectionType = this.getSectionType(sectionName);

    for (const [name, rawValue] of Object.entries(rawValues)) {
      const fieldName = this.generateFieldId(name);
      let value;

      if (
        // sectionType === SECTION_CUSTOM ||
        this.props.schema[name] === undefined
      ) {
        if (typeof rawValue === 'string') {
          value = splitMultipleField(rawValue).join('\n');
        } else if (Array.isArray(rawValue)) {
          value = rawValue.join('\n');
        }
      } else {
        const schema = this.props.schema[name];
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
        {schema && !name.startsWith('__') && (
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
    const schema = (schemaByName || {})[name];
    const type = schema ? schema.type : TYPE_TEXT;
    const multiple = !schema || schema.multiple;
    const description = (schema || {}).description;
    const decoratorOptions = {
      validateTrigger: false
    };
    const label = this.renderLabel(name, schema, multiple);

    let input;
    if (type === TYPE_TEXT) {
      if (multiple) {
        input = <Input.TextArea autoSize={{ minRows: 1, maxRows: 20 }} rows={1} />;
      } else {
        input = <Input disabled={schema && schema.readonly} />;
      }
    } else if (type === TYPE_BOOL) {
      input = <Checkbox>{description}</Checkbox>;
      decoratorOptions.valuePropName = 'checked';
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
      console.warn(`Unsupported item type: "${type}" for name: "${name}"`);
      // throw new Error(`Unsupported item type: "${type}"`);
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
    const fieldName = this.generateFieldId(name);

    const wrappedInput = this.props.form.getFieldDecorator(fieldName, decoratorOptions)(
      input
    );
    return <ConfigFormItem {...itemProps}>{wrappedInput}</ConfigFormItem>;
  }

  render() {
    let fields;
    if (this.props.showOverridden || Object.keys(this.props.schema).length <= 1) {
      fields = this.props.fields;
    } else {
      fields = Object.keys(this.props.schema);
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
      const group = this.props.schema[name] ? this.props.schema[name].group : 'Custom';
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
            schema={this.props.schema}
            onCreateId={this.handleCreateTocId}
          />
        </Col>
        <Col xs={24} sm={15} md={18}>
          <Form layout="vertical" className="config-form">
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
                  this.renderFormItem(
                    // this.props.initialValues[SECTION_NAME_KEY],
                    name,
                    this.props.schema
                  )
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
