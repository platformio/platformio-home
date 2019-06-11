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
import { goTo } from '../../core/helpers';

class AccountStatusBar extends React.Component {

  static propTypes = {
    router: PropTypes.object.isRequired,
    showInformationPage: PropTypes.func.isRequired
  }

  render() {
    return <Button type='default'
             shape='circle'
             icon='user'
             title='PIO Account'
             onClick={ () => this.props.showInformationPage() } />;
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    showInformationPage: () => goTo(ownProps.router.history, '/account')
  };
}

export default connect(mapStateToProps)(AccountStatusBar);
