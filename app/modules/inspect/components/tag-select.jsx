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

import PropTypes from 'prop-types';
import React from 'react';
import { Tag } from 'antd';

export class TagSelect extends React.PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        checked: PropTypes.bool
      })
    ),
    multi: PropTypes.bool,
    onChange: PropTypes.func
  };

  constructor(...args) {
    super(...args);

    const { multi, items } = this.props;
    this.state = {};
    for (const { name, checked } of items) {
      if (multi) {
        this.state[name] = checked;
      } else {
        this.state = { [name]: checked };
      }
    }
  }
  handleChange = (name, checked) => {
    const { multi } = this.props;
    if (!multi && !checked) {
      // Radio can only be checked, but not unchedcked
      return;
    }

    this.setState(state => {
      const { onChange } = this.props;
      let nextState = { [name]: checked };
      if (multi) {
        nextState = {
          ...state,
          nextState
        };
      }
      if (onChange) {
        const value = Object.entries(nextState)
          .filter(({ checked: x }) => x)
          .map(({ name: x }) => x);

        onChange(value);
      }
      return nextState;
    });
  };

  render() {
    const { items } = this.props;
    return items.map(({ name }) => (
      <Tag.CheckableTag
        key={name}
        checked={this.state[name]}
        onChange={checked => this.handleChange(name, checked)}
      >
        {name}
      </Tag.CheckableTag>
    ));
  }
}
