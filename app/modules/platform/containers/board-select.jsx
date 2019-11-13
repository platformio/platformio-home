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

import { Icon, Select, Spin } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { cmpSort } from '../../core/helpers';
import { connect } from 'react-redux';
import { loadBoards } from '../../platform/actions';
import { selectNormalizedBoards } from '../selectors';

class BoardSelect extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func.isRequired,
    loadBoards: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    if (!this.props.items) {
      this.props.loadBoards();
    }
  }

  onDidChange(boardId) {
    this.props.onChange(this.props.items.find(item => item.id === boardId));
  }

  render() {
    if (!this.props.items) {
      return <Spin size="small" />;
    }

    const data = {};
    this.props.items
      .sort((a, b) =>
        cmpSort(a.platform.title.toUpperCase(), b.platform.title.toUpperCase())
      )
      .forEach(item => {
        const group = item.platform.title;
        const candidates = data[group] || [];
        candidates.push(item);
        data[group] = candidates;
      });

    return (
      <Select
        showSearch
        style={{ width: '100%' }}
        size="large"
        placeholder={`Select a board (${this.props.items.length} available)`}
        optionFilterProp="children"
        filterOption={(input, option) => {
          if (typeof option.props.children === 'string') {
            return option.props.children
              .toLowerCase()
              .includes(input.toLocaleLowerCase());
          }
          // Skipping groups because matched group shows all its options
          return false;
        }}
        onChange={::this.onDidChange}
      >
        {Object.keys(data).map(group => (
          <Select.OptGroup
            key={group}
            label={
              <span>
                <Icon type="appstore" /> {group}
              </span>
            }
          >
            {data[group]
              .sort((a, b) => cmpSort(a.name.toUpperCase(), b.name.toUpperCase()))
              .map(item => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name.includes(item.vendor)
                    ? item.name
                    : `${item.name} (${item.vendor})`}
                </Select.Option>
              ))}
          </Select.OptGroup>
        ))}
      </Select>
    );
  }
}

// Redux

function mapStateToProps(state) {
  return {
    items: selectNormalizedBoards(state)
  };
}

export default connect(mapStateToProps, {
  loadBoards
})(BoardSelect);
