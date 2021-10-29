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
  FRAMEWORKS_INPUT_FILTER_KEY,
  selectFrameworksFilter,
  selectVisibleFrameworks,
} from '../selectors';

import FrameworksList from '../components/frameworks-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';

class FrameworksPage extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object.isRequired),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadRegistryFrameworks: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
  };

  constructor() {
    super(...arguments);
    this.props.loadRegistryFrameworks();
  }

  render() {
    return (
      <div className="page-container">
        <FrameworksList {...this.props} />
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisibleFrameworks(state),
    filterValue: selectFrameworksFilter(state),
    showPlatform: (name) =>
      goTo(ownProps.history, '/platforms/embedded/show', { name }),
    showFramework: (name) =>
      goTo(ownProps.history, '/platforms/frameworks/show', { name }),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, actions, {
      setFilter: (value) =>
        dispatch(lazyUpdateInputValue(FRAMEWORKS_INPUT_FILTER_KEY, value)),
    }),
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(FrameworksPage);
