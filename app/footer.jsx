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

import * as workspaceSettings from './workspace/settings';

import { Icon, Layout } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { osOpenUrl } from './modules/core/actions';

class AppFooter extends React.Component {
  static propTypes = {
    osOpenUrl: PropTypes.func.isRequired,
  };

  render() {
    return (
      <Layout.Footer>
        <center>
          <div className="block">{this.renderQuickLinks()}</div>
          {workspaceSettings.get('name') === 'platformio'
            ? this.renderPIOCoreBanner()
            : this.renderPoweredByPlatformIO()}
        </center>
      </Layout.Footer>
    );
  }

  renderQuickLinks() {
    const links = workspaceSettings.get('footerQuickLinks', []);
    const items = [];
    links.forEach((item, index) => {
      items.push(<a onClick={() => this.props.osOpenUrl(item.url)}>{item.title}</a>);
      if (index < links.length - 1) {
        items.push('·');
      }
    });
    return (
      <ul className="list-inline">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  renderPIOCoreBanner() {
    return (
      <div className="block">
        If you enjoy using PlatformIO, please star our projects on GitHub!
        <ul className="list-inline">
          <li>
            <Icon type="star"></Icon>
          </li>
          <li>
            <a
              onClick={() =>
                this.props.osOpenUrl('https://github.com/platformio/platformio-core')
              }
            >
              PlatformIO Core
            </a>
          </li>
          <li>
            <Icon type="star"></Icon>
          </li>
        </ul>
      </div>
    );
  }

  renderPoweredByPlatformIO() {
    return (
      <div className="powered-by-platformio">
        <ul className="list-inline">
          <li>Powered by</li>
          <li>
            <a onClick={() => this.props.osOpenUrl('https://platformio.org')}>
              <img
                src={require('./workspace/platformio/platformio_logo.png').default}
                height="38"
              />
            </a>
          </li>
          <li className="pio-company-text">
            <a onClick={() => this.props.osOpenUrl('https://platformio.org')}>
              <h3>
                PlatformIO <small>Enterprise</small>
              </h3>
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default connect(null, {
  osOpenUrl,
})(AppFooter);
