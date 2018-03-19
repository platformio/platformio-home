/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as workspaceSettings from './workspace/settings';

import { Icon, Layout } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { osOpenUrl } from './modules/core/actions';


class AppFooter extends React.Component {

  static propTypes = {
    osOpenUrl: PropTypes.func.isRequired
  }

  render() {
    return (
      <Layout.Footer>
        <center>
        <div className='block'>
          { this.renderQuickLinks() }
        </div>
        { workspaceSettings.get('name') === 'platformio' ? this.renderPIOCoreBanner() : this.renderPoweredByPlatformIO() }
        </center>
      </Layout.Footer>);
  }

  renderQuickLinks() {
    const links = workspaceSettings.get('footerQuickLinks', []);
    const items = [];
    links.forEach((item, index) => {
      items.push(<a onClick={ () => this.props.osOpenUrl(item.url) }>
                   { item.title }
                 </a>);
      if (index < links.length - 1) {
        items.push('·');
      }
    });
    return (
      <ul className='list-inline'>
        { items.map((item, index) => (
            <li key={ index }>
              { item }
            </li>
          )) }
      </ul>
      );
  }

  renderPIOCoreBanner() {
    return (
      <div className='block'>
        If you enjoy using PlatformIO, please star our projects on GitHub!
        <ul className='list-inline'>
          <li>
            <Icon type='star'></Icon>
          </li>
          <li>
            <a onClick={ () => this.props.osOpenUrl('https://github.com/platformio/platformio-core') }>PlatformIO Core</a>
          </li>
          <li>
            <Icon type='star'></Icon>
          </li>
        </ul>
      </div>
      );
  }

  renderPoweredByPlatformIO() {
    return (
      <div className='powered-by-platformio'>
        <ul className='list-inline'>
          <li>
            Powered by
          </li>
          <li>
            <a onClick={ () => this.props.osOpenUrl('https://platformio.org') }><img src={ require('./workspace/platformio/platformio_logo.png') } height='38' /></a>
          </li>
          <li className='pio-company-text'>
            <a onClick={ () => this.props.osOpenUrl('https://platformio.org') }><h3>PlatformIO <small>Enterprise</small></h3></a>
          </li>
        </ul>
      </div>
      );
  }

}

export default connect(null, {
  osOpenUrl
})(AppFooter);
