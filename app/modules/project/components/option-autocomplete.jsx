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

import { AutoComplete, Icon, Input } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

export class OptionAutocomplete extends React.PureComponent {
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
    multiple: PropTypes.bool,
    // callbacks
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onLoad: PropTypes.func
  };

  constructor(...args) {
    super(...args);
    this.state = { loading: false };
  }

  componentDidMount() {
    this.setState({ value: this.props.defaultValue });
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

  handleBlur = (...args) => {
    if (this.props.onBlur) {
      this.props.onBlur(...args);
    }
  };

  handleChange = value => {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  handleSearch = value => {
    this.setState({ value });
  };

  handleSelect = value => {
    this.setState({ value });
  };

  handleFilter = (inputValue, option) =>
    this.props.multiple ||
    option.props.value.toLowerCase().includes(inputValue.toLowerCase());

  render() {
    const selectedValues = this.state.value ? this.state.value.split('\n') : [];
    const ds =
      this.props.items &&
      this.props.items
        .filter(o => !this.props.multiple || !selectedValues.includes(o.value))
        .map(o => {
          let name = o.name;
          let value = o.value;
          if (this.props.multiple && selectedValues.length) {
            name = `… ${value}`;
            value = [...selectedValues, value].join('\n');
          }
          return (
            <AutoComplete.Option key={value} value={value}>
              {name}
            </AutoComplete.Option>
          );
        });
    return (
      <AutoComplete
        {...this.props.inputProps}
        dataSource={ds}
        defaultValue={this.props.defaultValue}
        filterOption={this.handleFilter}
        loading={this.state.loading}
        optionLabelProp="value"
        onBlur={this.handleBlur}
        onFocus={this.handleInputFocus}
        onChange={this.handleChange}
        onSearch={this.handleSearch}
        onSelect={this.handleSelect}
      >
        {this.props.multiple ? (
          <Input.TextArea />
        ) : (
          <Input suffix={<Icon type="search" />} />
        )}
      </AutoComplete>
    );
  }
}
