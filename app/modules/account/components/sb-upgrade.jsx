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
    upgradePlan: PropTypes.string,
    osOpenUrl: PropTypes.func.isRequired
  }

  render() {
    if (!this.props.upgradePlan) {
      return null;
    }
    return <Button type='danger' icon='star' onClick={ () => this.props.osOpenUrl('https://platformio.org/pricing?utm_campaign=account-sb') }>UPGRADE</Button>;
  }

}
