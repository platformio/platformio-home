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

import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { osOpenUrl } from '../../core/actions';
import { selectStorageItem } from '../../../store/selectors';

class PioVersions extends React.Component {
  static propTypes = {
    coreVersion: PropTypes.string,
    osOpenUrl: PropTypes.func.isRequired
  };

  renderCoreVersion() {
    if (this.props.coreVersion) {
      return <code>{this.props.coreVersion}</code>;
    }
    return <Spin size="small" />;
  }

  render() {
    return (
      <div className="versions">
        <ul className="list-inline">
          <li>
            Core{' '}
            <a
              onClick={() =>
                this.props.osOpenUrl('https://docs.platformio.org/page/history.html')
              }
            >
              {this.renderCoreVersion()}
            </a>
          </li>
          <li>·</li>
          <li>
            Home{' '}
            <a
              onClick={() =>
                this.props.osOpenUrl(
                  'https://github.com/platformio/platformio-home/releases'
                )
              }
            >
              <code>{APP_VERSION}</code>
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

// Redux

function mapStateToProps(state) {
  return {
    coreVersion: selectStorageItem(state, 'coreVersion')
  };
}

export default connect(mapStateToProps, { osOpenUrl })(PioVersions);
