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

import * as workspaceSettings from '../../../workspace/settings';

import PropTypes from 'prop-types';
import React from 'react';

export default class CompanyLogo extends React.Component {
  static propTypes = {
    width: PropTypes.string,
    height: PropTypes.string
  };

  render() {
    return (
      <img
        src={workspaceSettings.get('companyLogoSrc')}
        height={this.props.height || '200px'}
      />
    );
  }
}
