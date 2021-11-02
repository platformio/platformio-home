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

import CodeBeautifier from '../../core/containers/code-beautifier';
import PropTypes from 'prop-types';
import React from 'react';

export default class LibraryDetailInstallationBlock extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      id: PropTypes.number,
      ownername: PropTypes.string,
      name: PropTypes.string.isRequired,
      version: PropTypes.oneOfType([
        PropTypes.object, // registry library
        PropTypes.string, // built-in/installed library
      ]).isRequired,
      versions: PropTypes.array,
      platforms: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          title: PropTypes.string,
        })
      ),
      frameworks: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          title: PropTypes.string,
        })
      ),
    }).isRequired,
    osOpenUrl: PropTypes.func.isRequired,
  };

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
    const ownedLib = this.props.data.ownername
      ? `${this.props.data.ownername}/${this.props.data.name}`
      : this.props.data.name;
    let content = `# platformio.ini – project configuration file

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
lib_deps =`;

    if (!versionName) {
      content += `
  ${ownedLib}
      `;
      return content;
    }

    if (!versionName.match(/^[\d\.]+$/)) {
      content += `
  ${ownedLib} @ ${versionName}
      `;
      return content;
    }

    content += `
  # RECOMMENDED
  # Accept new functionality in a backwards compatible manner and patches
  ${ownedLib} @ ^${versionName}

  # Accept only backwards compatible bug fixes
  # (any version with the same major and minor versions, and an equal or greater patch version)
  ${ownedLib} @ ~${versionName}

  # The exact version
  ${ownedLib} @ ${versionName}
    `;

    return content;
  }

  render() {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>
          Library Dependencies <small>platformio.ini</small>
        </h2>
        <div className="block">
          <p>
            The PlatformIO Registry is fully compatible with{' '}
            <a onClick={() => this.props.osOpenUrl('https://semver.org/')}>
              Semantic Versioning
            </a>{' '}
            and its &quot;version&quot; scheme{' '}
            <code>&lt;major&gt;.&lt;minor&gt;.&lt;patch&gt;</code>. You can declare
            library dependencies in &quot;platformio.ini&quot; configuration file using{' '}
            <a
              onClick={() =>
                this.props.osOpenUrl(
                  'https://docs.platformio.org/page/projectconf/section_env_library.html#lib-deps'
                )
              }
            >
              lib_deps
            </a>{' '}
            option.
          </p>
        </div>
        <CodeBeautifier language="ini" content={this.generatePIOProjectConf()} />
      </div>
    );
  }
}
