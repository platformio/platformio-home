/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Alert, Icon } from 'antd';

import CodeBeautifier from '../../core/containers/code-beautifier';
import PropTypes from 'prop-types';
import React from 'react';


export default class LibraryDetailInstallationBlock extends React.Component {

  static propTypes = {
    data: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      version: PropTypes.oneOfType([
        PropTypes.object, // registry library
        PropTypes.string // built-in/installed library
      ]).isRequired,
      versions: PropTypes.array,
      platforms: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        title: PropTypes.string
      })),
      frameworks: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        title: PropTypes.string
      }))
    }).isRequired,
    openUrl: PropTypes.func.isRequired
  }

  getVersionName() {
    if (!this.props.data || !this.props.data.version) {
      return null;
    }
    if (this.props.data.version && this.props.data.version.name) {
      return this.props.data.version.name;
    }
    return this.props.data.version;
  }

  generatePIOProjectConf() {
    const versionName = this.getVersionName();

    let content = `; PlatformIO Project Configuration File
;
;   Build options: build flags, source filter
;   Upload options: custom upload port, speed and extra flags
;   Library options: dependencies, extra library storages
;   Advanced options: extra scripting
;
; Please visit documentation for the other options and examples
; http://docs.platformio.org/page/projectconf.html

[env:my_build_env]`;

    if (this.props.data.platforms && this.props.data.platforms.length) {
      content += `
platform = ${this.props.data.platforms[0].name}`;
    }
    if (this.props.data.frameworks && this.props.data.frameworks.length) {
      content += `
framework = ${this.props.data.frameworks[0].name}`;
    }

    content += `

lib_deps =
  # Using a library name
  ${this.props.data.name}
    `;

    if (this.props.data.id) {
      content += `
  # ... or using library Id
  ${this.props.data.id}
      `;
    }

    if (!versionName) {
      return content;
    }

    content += `
  # ... or depend on a specific version
  ${this.props.data.name}@${versionName}
    `;

    if (versionName.includes('.')) {
      content += `
  # Semantic Versioning Rules
  # http://docs.platformio.org/page/userguide/lib/cmd_install.html#description
  ${this.props.data.name}@^${versionName}
  ${this.props.data.name}@~${versionName}
  ${this.props.data.name}@>=${versionName}`;
    }
    return content;
  }

  render() {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>Project Dependencies <small>platformio.ini</small></h2>
        <div className='block'>
          PlatformIO Core has built-in powerful <a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/librarymanager/index.html') }>Library Manager</a> with a <i>Semantic Versioning</i> support. It allows you to specify custom dependencies per project in <a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/projectconf.html') }>Project Configuration File &quot;platformio.ini&quot;</a> using <kbd>lib_deps</kbd> option.
        </div>
        <div className='block'>
          No need to install them manully. PlatformIO will install all dependencies into a project <u>isolated storage</u> when you start building process.
        </div>
        <Alert className='block' showIcon message='Recommendation' description={ <span>We highly recommend to specify all project dependecies with <kbd>lib_deps</kbd> option and to avoid using <strike>global libraries</strike>.</span> } />
        <div className='block'><Icon type='caret-right'/> <a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/userguide/lib/cmd_install.html#description') }>Semantic Versioning Rules</a></div>
        <CodeBeautifier language='ini' content={ this.generatePIOProjectConf() } />
      </div>
      );
  }

}
