/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Icon } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';


export default class LibraryDetailHeaders extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired
  }

  render() {
    if (!this.props.items.length) {
      return (
        <ul className='background-message text-center'>
          <li>
            No headers
          </li>
        </ul>);
    }
    return (
      <div>
        { this.props.items.sort().map(header => (
            <h3 key={ header }><Icon type='file-add' /> { header }</h3>
          )) }
      </div>);
  }
}
