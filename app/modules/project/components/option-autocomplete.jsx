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

import { AutoComplete, Button, Icon, Input, Select, Tag } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { splitMultipleField } from '@project/helpers';

export const MODE_AUTOCOMPLETE = 'autocomplete';
export const MODE_SELECT = 'select';
export const MODE_TAGS = 'tags';

export class OptionAutocomplete extends React.PureComponent {
  static defaultProps = {
    addIcon: 'plus',
    addText: 'Add',
    mode: MODE_AUTOCOMPLETE
  };

  static propTypes = {
    // data
    addIcon: PropTypes.string,
    addPlaceholder: PropTypes.string,
    addText: PropTypes.string,
    defaultValue: PropTypes.string,
    inputProps: PropTypes.object,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    ),
    mode: PropTypes.oneOf([MODE_AUTOCOMPLETE, MODE_SELECT, MODE_TAGS]),
    multiple: PropTypes.bool,
    remote: PropTypes.bool,
    // callbacks
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onLoad: PropTypes.func
  };

  constructor(...args) {
    super(...args);
    this.state = { loading: false, values: [], autocompleterValue: '' };
  }

  componentDidMount() {
    this.updateStateValues(this.props.defaultValue);
  }

  load() {
    this.setState({
      loading: true
    });
    const load = this.props.onLoad(() => {
      this.setState({
        loading: false
      });
    });
    if (this.props.remote && load && load.then) {
      load
        .then(items => {
          this.setState({
            items
          });
        })
        .catch(() => {
          this.setState({ items: [] });
        });
    }
  }

  getData() {
    const items = this.props.remote ? this.state.items : this.props.items;
    const selectedValues = this.state.values;
    return (
      (items &&
        items
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
    if (this.props.mode === MODE_AUTOCOMPLETE && this.props.multiple) {
      return value && value.length ? value.join('\n') : [];
    }
    return value;
  }

  transformValueOut(value) {
    if (this.props.mode === MODE_AUTOCOMPLETE && this.props.multiple) {
      return value && value.length ? splitMultipleField(value) : [];
    }
    return value;
  }

  updateStateValues(values) {
    this.setState({
      values:
        typeof values === 'string'
          ? values.split('\n')
          : Array.isArray(values)
          ? values
          : []
    });
  }

  handleInputFocus = () => {
    if (this.props.onLoad) {
      this.load();
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
    if (this.props.remote) {
      // TODO: load
    }
  };

  handleSelect = () => {
    // this.updateStateValues(value);
  };

  handleFilter = (inputValue, option) =>
    this.props.multiple ||
    option.props.value.toLowerCase().includes(inputValue.toLowerCase());

  handleTagClose = value => {
    this.setState({
      values: this.state.values.filter(v => v !== value)
    });
  };

  handleAddValueBtnClick = () => {
    this.setState({ autocompleterVisible: true }, () => this.autocomplete.focus());
  };

  handleAutocompleteRef = autocomplete => {
    this.autocomplete = autocomplete;
  };

  handleKeyUp = e => {
    if (e.keyCode === 13) {
      if (this.state.autocompleterValue && this.state.autocompleterValue.length) {
        this.handleChange([
          ...(this.state.values || []),
          this.state.autocompleterValue
        ]);
      }
      this.setState({
        autocompleterValue: '',
        autocompleterVisible: false
      });
    }
  };

  handleAddValueChange = value => {
    this.setState({ autocompleterValue: value });
  };

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

    if (this.props.mode === MODE_TAGS) {
      return (
        <div className="option-autocomplete mode-tags">
          <div className="block">
            {(this.state.values || []).map(value => (
              <Tag closable key={value} onClose={() => this.handleTagClose(value)}>
                {value}
              </Tag>
            ))}
          </div>
          {!this.state.autocompleterVisible && (
            <Button
              onClick={this.handleAddValueBtnClick}
              // style={{ background: '#fff', borderStyle: 'dashed' }}
            >
              {this.props.addIcon && <Icon type={this.props.addIcon} />}{' '}
              {this.props.addText}
            </Button>
          )}
          {this.state.autocompleterVisible && (
            <AutoComplete
              {...this.props.inputProps}
              dataSource={ds.map(({ name, value }) => (
                <AutoComplete.Option key={value} value={value}>
                  {name}
                </AutoComplete.Option>
              ))}
              filterOption={this.handleFilter}
              onChange={this.handleAddValueChange}
              optionLabelProp="value"
              ref={this.handleAutocompleteRef}
              value={this.state.autocompleterValue}
            >
              <Input suffix={<Icon type="search" />} onKeyUp={this.handleKeyUp} />
            </AutoComplete>
          )}
        </div>
      );
    }

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
