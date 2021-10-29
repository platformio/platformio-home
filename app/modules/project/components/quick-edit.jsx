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

import Animate from 'rc-animate';
import PropTypes from 'prop-types';
import React from 'react';

export class QuickEdit extends React.PureComponent {
  static propTypes = {
    // data
    inputProps: PropTypes.object,
    placeholder: PropTypes.string,
    value: PropTypes.string,

    // callbacks
    onSave: PropTypes.func.isRequired,
  };

  constructor(...args) {
    super(...args);
    this.state = { editing: false };
  }

  beginEdit() {
    this.setState(
      {
        value: this.props.value,
        editing: true,
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
      this.setState({ saving: true });
      this.props.onSave(this.state.value, () => {
        this.setState({ saving: false });
      });
    }
    this.setState({ editing: false });
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };

  handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.stopEdit(true);
  };

  handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.stopEdit();
  };

  handleBeginEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.beginEdit();
  };

  handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      // Escape
      this.stopEdit();
    } else if (e.keyCode === 13) {
      // Return
      this.stopEdit(true);
    }
  };

  handleUpdateRef = ($el) => {
    this.$input = $el;
  };

  renderEditor() {
    return (
      <div className="quick-edit" key={'1'}>
        <div className="input-col">
          <Input
            {...this.props.inputProps}
            onBlur={this.handleSaveClick}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            placeholder={this.props.placeholder}
            ref={this.handleUpdateRef}
            value={this.state.value}
          />
        </div>
        <span className="buttons">
          <Button type="primary" onClick={this.handleSaveClick}>
            <span className="return-icon">⏎</span>
            Save
          </Button>
          <span className="delimiter"> or </span>
          <a onClick={this.handleCancelClick}>Cancel</a>
        </span>
      </div>
    );
  }

  render() {
    return (
      <div className="quick-edit-target-container">
        <span onClick={this.handleBeginEditClick} style={{ cursor: 'text' }}>
          {this.props.value || this.props.placeholder}
        </span>
        <Tooltip title="Inline edit description">
          <Button
            className="quick-edit-btn"
            icon="edit"
            loading={this.state.saving}
            size="small"
            type="link"
            onClick={this.handleBeginEditClick}
          ></Button>
        </Tooltip>
        <Animate transitionName="fade" transitionAppear>
          {this.state.editing ? this.renderEditor() : null}
        </Animate>
      </div>
    );
  }
}
