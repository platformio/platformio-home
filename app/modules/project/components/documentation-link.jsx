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
import { SCOPE_PLATFORMIO } from '@project/constants';

export class DocumentationLink extends React.PureComponent {
  static propTypes = {
    // data
    children: PropTypes.any,
    name: PropTypes.string,
    group: PropTypes.string.isRequired,
    scope: PropTypes.string.isRequired,

    // callbacks
    onClick: PropTypes.func.isRequired,
  };

  getDocumentationUrl(scope, group, name) {
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

  handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onClick(
      this.getDocumentationUrl(this.props.scope, this.props.group, this.props.name)
    );
  };

  render() {
    return (
      <span className="documentation-link">
        <Tooltip title={`Open documentation for "${this.props.name}"`}>
          <a onClick={this.handleClick}>
            <Icon type="question-circle" />
            {this.props.children ? ' ' : undefined}
            {this.props.children ? this.props.children : undefined}
          </a>
        </Tooltip>
      </span>
    );
  }
}
