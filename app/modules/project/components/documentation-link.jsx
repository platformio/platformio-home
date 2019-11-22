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

import { Icon, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

export class DocumentationLink extends React.PureComponent {
  static propTypes = {
    // data
    url: PropTypes.string.isRequired,
    // callbacks
    onClick: PropTypes.func.isRequired
  };

  handleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onClick(this.props.url);
  };

  render() {
    return (
      <span className="documentation-link">
        <Tooltip title="Documentation">
          <a onClick={this.handleClick} title={this.props.url}>
            <Icon type="question-circle" />
          </a>
        </Tooltip>
      </span>
    );
  }
}
