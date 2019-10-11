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

import { Button } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';

class AccountStatusBar extends React.Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
    showInformationPage: PropTypes.func.isRequired
  };

  render() {
    return (
      <Button
        type="default"
        shape="circle"
        icon="user"
        title="PIO Account"
        onClick={() => this.props.showInformationPage()}
      />
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    showInformationPage: () => goTo(ownProps.router.history, '/account')
  };
}

export default connect(mapStateToProps)(AccountStatusBar);
