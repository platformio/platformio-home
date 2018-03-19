/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
  }

  renderCoreVersion() {
    if (this.props.coreVersion) {
      return <code>{ this.props.coreVersion }</code>;
    }
    return (
      <Spin size='small' />
    );
  }

  render() {
    return (
      <div className='versions'>
        <ul className='list-inline'>
          <li>
            Home <code>{ APP_VERSION }</code>
          </li>
          <li>
            ·
          </li>
          <li>
            Core <a onClick={ () => this.props.osOpenUrl('https://github.com/platformio/platformio/blob/develop/HISTORY.rst') }>{ this.renderCoreVersion() }</a>
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
