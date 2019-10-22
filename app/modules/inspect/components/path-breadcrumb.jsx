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

import * as pathlib from '@core/path';

import { Breadcrumb, Icon } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';

export class PathBreadcrumb extends React.PureComponent {
  static propTypes = {
    path: PropTypes.string,
    onChange: PropTypes.func
  };

  handleItemClick = e => {
    e.preventDefault();
    const a = e.target.closest('a');
    if (!a) {
      return;
    }
    const { path, onChange } = this.props;
    const idx = parseInt(a.dataset.idx);
    if (idx === 0) {
      onChange();
      return;
    }

    const parts = this.splitPath(path);
    const device = parts.shift();

    if (idx > 0) {
      onChange(device + pathlib.join(...parts.slice(0, idx - 1)));
    } else {
      onChange(device);
    }
  };

  splitPath(path) {
    const sepIdx = path.indexOf(pathlib.sep);
    if (sepIdx === -1) {
      return [path];
    }
    const device = path.substring(0, sepIdx + 1);
    const devicePathParts = pathlib.split(path.substring(device.length));

    return [device, ...devicePathParts];
  }

  render() {
    const { path } = this.props;
    const parts = path !== undefined ? this.splitPath(path) : [];
    let lastName;
    if (parts.length) {
      lastName = parts.pop();
    }
    return (
      <Breadcrumb className="block" separator={pathlib.sep}>
        <Breadcrumb.Item key={0}>
          <a data-idx={0} onClick={this.handleItemClick}>
            <Icon type="book" />
          </a>
        </Breadcrumb.Item>
        {parts.map(
          (name, i) =>
            name !== '/' && (
              <Breadcrumb.Item key={i + 1}>
                <a data-idx={i + 1} onClick={this.handleItemClick}>
                  {name}
                </a>
              </Breadcrumb.Item>
            )
        )}
        {lastName !== undefined && (
          <Breadcrumb.Item key={-1}>{lastName}</Breadcrumb.Item>
        )}
      </Breadcrumb>
    );
  }
}
