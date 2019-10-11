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

import { Icon } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

export default class LibraryDetailHeaders extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  render() {
    if (!this.props.items.length) {
      return (
        <ul className="background-message text-center">
          <li>No headers</li>
        </ul>
      );
    }
    return (
      <div>
        {this.props.items.sort().map(header => (
          <h3 key={header}>
            <Icon type="file-add" /> {header}
          </h3>
        ))}
      </div>
    );
  }
}
