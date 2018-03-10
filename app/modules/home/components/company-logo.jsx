/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as workspaceSettings from '../../../workspace/settings';

import PropTypes from 'prop-types';
import React from 'react';


export default class CompanyLogo extends React.Component {

  static propTypes = {
    width: PropTypes.string,
    height: PropTypes.string
  }

  render() {
    return (
      <img src={ workspaceSettings.get('companyLogoSrc') } height={ this.props.height || '200px' } />
      );
  }
}
