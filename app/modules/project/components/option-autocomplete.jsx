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

import { AutoComplete, Icon, Input, Select } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { splitMultipleField } from '@project/helpers';

export const MODE_AUTOCOMPLETE = 'autocomplete';
export const MODE_SELECT = 'select';

export class OptionAutocomplete extends React.PureComponent {
  static defaultProps = {
    mode: MODE_AUTOCOMPLETE
  };

  static propTypes = {
    // data
    defaultValue: PropTypes.string,
    inputProps: PropTypes.object,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    ),
    mode: PropTypes.oneOf([MODE_AUTOCOMPLETE, MODE_SELECT]),
    multiple: PropTypes.bool,
    // callbacks
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onLoad: PropTypes.func
  };

  constructor(...args) {
    super(...args);
    this.state = { loading: false, values: [] };
  }

  componentDidMount() {
    this.updateStateValues(this.props.defaultValue);
  }

  getData() {
    const selectedValues = this.state.values;
    return (
      (this.props.items &&
        this.props.items
          .filter(o => !this.props.multiple || !selectedValues.includes(o.value))
          .map(o => {
            let name = o.name;
            let value = o.value;
            if (
              this.props.multiple &&
              selectedValues.length &&
              this.props.mode === MODE_AUTOCOMPLETE
            ) {
              name = `… ${value}`;
              value = [...selectedValues, value].join('\n');
            }
            return { name, value };
          })) ||
      []
    );
  }

  transformValueIn(value) {
    if (this.props.mode === MODE_SELECT && this.props.multiple) {
      return value && value.length ? splitMultipleField(value) : [];
    }
    return value;
  }

  transformValueOut(value) {
    return this.props.mode === MODE_SELECT && this.props.multiple && value
      ? value.join('\n')
      : '';
  }

  updateStateValues(values) {
    this.setState({
      values:
        this.props.mode === MODE_SELECT
          ? values
          : values && values.length
          ? values.split('\n')
          : []
    });
  }

  handleInputFocus = () => {
    if (this.props.onLoad) {
      this.setState({
        loading: true
      });
      this.props.onLoad(() => {
        this.setState({
          loading: false
        });
      });
    }
  };

  handleBlur = value => {
    if (this.props.onBlur) {
      this.props.onBlur(this.transformValueOut(value));
    }
  };

  handleChange = value => {
    this.updateStateValues(value);
    if (this.props.onChange) {
      this.props.onChange(this.transformValueOut(value));
    }
  };

  handleSearch = value => {
    this.updateStateValues(value);
  };

  handleFilter = (inputValue, option) =>
    this.props.multiple ||
    option.props.value.toLowerCase().includes(inputValue.toLowerCase());

  render() {
    const ds = this.getData();
    const commonProps = {
      defaultValue: this.transformValueIn(this.props.defaultValue),
      loading: this.state.loading,
      onBlur: this.handleBlur,
      onFocus: this.handleInputFocus,
      onChange: this.handleChange,
      onSearch: this.handleSearch
    };

    if (this.props.mode === MODE_AUTOCOMPLETE) {
      return (
        <AutoComplete
          {...this.props.inputProps}
          dataSource={ds.map(({ name, value }) => (
            <AutoComplete.Option key={value} value={value}>
              {name}
            </AutoComplete.Option>
          ))}
          filterOption={this.handleFilter}
          optionLabelProp="value"
          {...commonProps}
        >
          {this.props.multiple ? (
            <Input.TextArea />
          ) : (
            <Input suffix={<Icon type="search" />} />
          )}
        </AutoComplete>
      );
    }
    if (this.props.mode === MODE_SELECT) {
      return (
        <Select
          {...this.props.inputProps}
          allowClear
          mode={this.props.multiple ? 'multiple' : 'default'}
          {...commonProps}
        >
          {ds.map(({ name, value }) => (
            <Select.Option key={value} value={value} title={value}>
              {name}
            </Select.Option>
          ))}
        </Select>
      );
    }
  }
}
