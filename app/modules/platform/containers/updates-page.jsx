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

import * as actions from '../actions';

import {
  UPDATES_INPUT_FILTER_KEY,
  selectUpdatesFilter,
  selectVisiblePlatformUpdates
} from '../selectors';
import { osOpenUrl, osRevealFile } from '../../core/actions';

import PlatformsList from '../components/platforms-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';

class PlatformUpdatesPage extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object.isRequired),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadPlatformUpdates: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    updatePlatform: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.props.loadPlatformUpdates();
  }

  render() {
    return (
      <div className="page-container">
        <PlatformsList {...this.props} actions={['reveal', 'update']} />
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisiblePlatformUpdates(state),
    filterValue: selectUpdatesFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platforms/installed/show', { name }),
    showFramework: name =>
      goTo(ownProps.history, '/platforms/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, actions, {
      osOpenUrl,
      osRevealFile,
      setFilter: value =>
        dispatch(lazyUpdateInputValue(UPDATES_INPUT_FILTER_KEY, value))
    }),
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformUpdatesPage);
