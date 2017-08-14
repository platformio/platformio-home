/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { BOARDS_INPUT_FILTER_KEY, selectBoardsFilter, selectVisibleBoards } from '../selectors';

import Boards from '../components/boards';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';
import { openUrl } from '../../core/actions';


class BoardsPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadBoards: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired
  }

  componentWillMount() {
    if (!this.props.items) {
      this.props.loadBoards();
    }
  }

  render() {
    return (
      <section className='page-container'>
        <Boards
          items={ this.props.items }
          defaultFilter={ this.props.filterValue }
          onFilter={ this.props.setFilter }
          showPlatform={ this.props.showPlatform }
          showFramework={ this.props.showFramework }
          openUrl={ this.props.openUrl } />
      </section>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisibleBoards(state),
    filterValue: selectBoardsFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platforms/embedded/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platforms/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    openUrl,
    setFilter: value => dispatch(lazyUpdateInputValue(BOARDS_INPUT_FILTER_KEY, value))
  }), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BoardsPage);
