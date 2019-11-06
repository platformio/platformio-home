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

import { Button, Input, Tooltip } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';

export class QuickEdit extends React.PureComponent {
  static propTypes = {
    // data
    inputProps: PropTypes.object,
    placeholder: PropTypes.string,
    value: PropTypes.string,

    // callbacks
    onSave: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  beginEdit() {
    this.setState(
      {
        value: this.props.value,
        editing: true
      },
      () => {
        if (this.$input) {
          this.$input.focus();
        }
      }
    );
  }

  stopEdit(save) {
    if (save && this.state.value !== this.props.value) {
      this.props.onSave(this.state.value);
    }
    this.setState({ editing: false });
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSaveClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.stopEdit(true);
  }

  handleBeginEditClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.beginEdit();
  }

  handleKeyDown(e) {
    if (e.keyCode === 27) {
      // Escape
      this.stopEdit();
    }
  }

  render() {
    if (this.state.editing) {
      return (
        <React.Fragment>
          <Input.Search
            {...this.props.inputProps}
            className="quick-edit"
            enterButton={<Button icon="save" size="small" type="primary"></Button>}
            onBlur={::this.handleSaveClick}
            onChange={::this.handleChange}
            onKeyDown={::this.handleKeyDown}
            onPressEnter={::this.handleSaveClick}
            placeholder={this.props.placeholder}
            ref={$el => (this.$input = $el)}
            value={this.state.value}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <span onClick={::this.handleBeginEditClick} style={{ cursor: 'text' }}>
          {this.props.value || this.props.placeholder}
        </span>
        <Tooltip title="Inline edit description">
          <Button
            icon="edit"
            size="small"
            type="link"
            onClick={::this.handleBeginEditClick}
          ></Button>
        </Tooltip>
      </React.Fragment>
    );
  }
}
