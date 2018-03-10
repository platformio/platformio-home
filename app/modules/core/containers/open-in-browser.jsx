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
import { connect } from 'react-redux';
import { inIframe } from '../helpers';
import { osOpenUrl } from '../actions';


class OpenInBrowser extends React.Component {

  static propTypes = {
    osOpenUrl: PropTypes.func.isRequired
  }

  onDidOpen() {
    this.props.osOpenUrl(window.location.href);
  }

  render() {
    if (!inIframe()) {
      return null;
    }
    return <Button icon='arrows-alt' title='Open in browser' onClick={ () => this.onDidOpen() }></Button>;
  }
}

// Redux

export default connect(null, {
  osOpenUrl
})(OpenInBrowser);
