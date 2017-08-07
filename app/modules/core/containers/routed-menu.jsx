/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Badge, Icon, Menu } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../helpers';
import { selectRouteBadges } from '../selectors';


class RoutedMenu extends React.Component {

  static propTypes = {
    router: PropTypes.object.isRequired,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
    badges: PropTypes.arrayOf(PropTypes.shape({
      path: PropTypes.string,
      count: PropTypes.number
    })),
    theme: PropTypes.string,
    mode: PropTypes.string
  }

  constructor() {
    super(...arguments);
    this.state = {
      selectedKeys: []
    };
    this._matchedBadges = [];
  }

  componentWillReceiveProps() {
    this.setState({
      selectedKeys: [this.activeRouteKey()]
    });
  }

  componentDidMount() {
    this.setState({
      selectedKeys: [this.activeRouteKey()]
    });
  }

  activeRouteKey() {
    for (const item of this.props.routes.slice(0).reverse()) {
      if (item.label && this.props.router.history.location.pathname.startsWith(item.path)) {
        return item.path;
      }
    }
  }

  getRouteBadgeCount(path) {
    if (!this.props.badges) {
      return 0;
    }
    for (const item of this.props.badges) {
      if (item.path.startsWith(path) &&  !this._matchedBadges.includes(item.path)) {
        this._matchedBadges.push(item.path);
        return item.count;
      }
    }
    return 0;
  }

  render() {
    this._matchedBadges = [];
    const items = this.props.routes.slice(0).reverse().map(item => item.label && this.renderItem(item));
    return (
      <Menu theme={ this.props.theme }
        mode={ this.props.mode || 'inline' }
        defaultSelectedKeys={ [this.props.routes[0].path] }
        selectedKeys={ this.state.selectedKeys }
        onClick={ item => goTo(this.props.router.history, item.key) }>
        { items.reverse() }
      </Menu>
      );
  }

  renderItem(item) {
    const _icon = <Icon type={ item.icon } />;
    const _label = <span className='menu-item-label'>{ item.label }</span>;
    const count = item.path ? this.getRouteBadgeCount(item.path) : 0;
    if (count > 0) {
      return (
        <Menu.Item key={ item.path } title={ item.label }>
          <Badge overflowCount={ 99 } count={ count }>
            { _icon } { _label}
          </Badge>
        </Menu.Item>
      );
    }
    return (
      <Menu.Item key={ item.path } title={ item.label }>
        { _icon }
        { _label}
      </Menu.Item>
    );
  }
}

// Redux

function mapStateToProps(state) {
  return {
    badges: selectRouteBadges(state)
  };
}

export default connect(mapStateToProps)(RoutedMenu);
