/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';


export default class PlatformIOLogo extends React.Component {

  static propTypes = {
    width: PropTypes.string,
    height: PropTypes.string
  }

  render() {
    return (
      <img src={ require('../../../media/images/platformio_logo.png') } width={ this.props.width || '200px' } height={ this.props.height || '200px' } />
      );
  }
}
