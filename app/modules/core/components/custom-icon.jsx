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

export default class CustomIcon extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired
  };

  render() {
    return <span className="anticon custom-icon">{this.renderIcon()}</span>;
  }

  renderIcon() {
    switch (this.props.type) {
      case 'axis':
        return this.renderAxis();
    }
    return null;
  }

  renderAxis() {
    return (
      <svg
        viewBox="15 15 171 171"
        xmlns="http://www.w3.org/2000/svg"
        className="custom-icon-axis"
      >
        <g>
          <line
            y2="110.50676"
            x2="93"
            y1="36.5"
            x1="93"
            strokeLinecap="null"
            strokeLinejoin="null"
            strokeDasharray="null"
            strokeWidth="14"
            stroke="#000000"
            fill="none"
          />
          <line
            y2="170.745738"
            x2="67.478044"
            y1="103.563212"
            x1="67.478044"
            strokeLinecap="null"
            strokeLinejoin="null"
            strokeDasharray="null"
            strokeWidth="14"
            stroke="#000000"
            fill="none"
            transform="rotate(47.04828643798828 67.47804260253903,137.15447998046878)"
          />
          <line
            y2="150.50338"
            x2="126"
            y1="76.49662"
            x1="126"
            strokeLinecap="null"
            strokeLinejoin="null"
            strokeDasharray="null"
            strokeWidth="14"
            stroke="#000000"
            fill="none"
            transform="rotate(-90 126.00000000000001,113.50000000000001)"
          />
        </g>
      </svg>
    );
  }
}
