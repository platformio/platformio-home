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

import * as workspaceSettings from '../../../workspace/settings';

import { Badge, Icon, Menu } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { connectRouter } from '../../../store/actions';
import { goTo } from '../helpers';
import { selectRouteBadges } from '../selectors';

class RoutedMenu extends React.Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
    badges: PropTypes.arrayOf(
      PropTypes.shape({
        path: PropTypes.string,
        count: PropTypes.number
      })
    ),
    theme: PropTypes.string,
    mode: PropTypes.string,

    connectRouter: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      selectedKeys: []
    };
    this._matchedBadges = [];
    this.props.connectRouter(this.props.router);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.router.route.location.pathname ===
      prevProps.router.route.location.pathname
    ) {
      return;
    }
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
      if (
        item.label &&
        this.props.router.history.location.pathname.startsWith(item.path)
      ) {
        return item.path;
      }
    }
  }

  getRouteBadgeCount(path) {
    if (!this.props.badges || path === '/') {
      return 0;
    }
    for (const item of this.props.badges) {
      if (item.path.startsWith(path) && !this._matchedBadges.includes(item.path)) {
        this._matchedBadges.push(item.path);
        return item.count;
      }
    }
    return 0;
  }

  render() {
    this._matchedBadges = [];
    const items = this.props.routes
      .slice(0)
      .filter(
        item =>
          !workspaceSettings
            .get('menuIgnorePatterns', [])
            .some(pattern => pattern.test(item.path))
      )
      .reverse()
      .map(item => item.label && this.renderItem(item));
    return (
      <Menu
        theme={this.props.theme}
        mode={this.props.mode || 'inline'}
        defaultSelectedKeys={[this.props.routes[0].path]}
        selectedKeys={this.state.selectedKeys}
        onClick={item => goTo(this.props.router.history, item.key)}
      >
        {items.reverse()}
      </Menu>
    );
  }

  renderItem(item) {
    const _icon = <Icon type={item.icon} />;
    const _label = <span className="menu-item-label">{item.label}</span>;
    const count = item.path ? this.getRouteBadgeCount(item.path) : 0;
    if (count > 0) {
      return (
        <Menu.Item key={item.path} title={item.label}>
          <Badge overflowCount={99} count={count}>
            {_icon} {_label}
          </Badge>
        </Menu.Item>
      );
    }
    return (
      <Menu.Item key={item.path} title={item.label}>
        {_icon}
        {_label}
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

export default connect(mapStateToProps, { connectRouter })(RoutedMenu);
