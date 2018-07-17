/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Button } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';


export default class AccountStatusBarUpgrade extends React.Component {

  static propTypes = {
    upgradeInfo: PropTypes.shape({
      buttonLabel: PropTypes.string,
      url: PropTypes.string
    }).isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  render() {
    return <Button type='danger' icon='star' onClick={ () => this.props.osOpenUrl(this.props.upgradeInfo.url) }>{ this.props.upgradeInfo.buttonLabel }</Button>;
  }

}
