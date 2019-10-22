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

import React from 'react';
import { Spin } from 'antd';

export function withLoader(
  WrappedComponent,
  { itemsProp = 'items', message = 'Loading...', size = 'large' }
) {
  const HOC = class extends React.Component {
    render() {
      if (!this.props[itemsProp]) {
        return (
          <div className="text-center">
            <Spin tip={message} size={size} />
          </div>
        );
      }
      return <WrappedComponent {...this.props} />;
    }
  };
  HOC.displayName = 'withLoader';
  return HOC;
}
