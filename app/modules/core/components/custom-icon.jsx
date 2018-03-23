/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';


export default class CustomIcon extends React.Component {

  static propTypes = {
    type: PropTypes.string.isRequired
  }

  render() {
    return <span className='anticon custom-icon'>{ this.renderIcon() }</span>;
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
      <svg viewBox='15 15 171 171' xmlns='http://www.w3.org/2000/svg' className='custom-icon-axis'>
      <g>
        <line y2='110.50676' x2='93' y1='36.5' x1='93' strokeLinecap='null' strokeLinejoin='null' strokeDasharray='null' strokeWidth='14' stroke='#000000' fill='none'/>
        <line y2='170.745738' x2='67.478044' y1='103.563212' x1='67.478044' strokeLinecap='null' strokeLinejoin='null' strokeDasharray='null' strokeWidth='14' stroke='#000000' fill='none' transform='rotate(47.04828643798828 67.47804260253903,137.15447998046878)'/>
        <line y2='150.50338' x2='126' y1='76.49662' x1='126' strokeLinecap='null' strokeLinejoin='null' strokeDasharray='null' strokeWidth='14' stroke='#000000' fill='none' transform='rotate(-90 126.00000000000001,113.50000000000001)'/>
      </g>
      </svg>
    );
  }

}
