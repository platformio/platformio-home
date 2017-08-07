/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Route, Switch } from 'react-router';

import PropTypes from 'prop-types';
import React from 'react';
import RoutedMenu from '../containers/routed-menu';


export default class MultiPage extends React.Component {

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
    disableMenu: PropTypes.bool
  }

  render() {
    return (
      <div>
        { !this.props.disableMenu && <RoutedMenu router={ this.context.router } routes={ this.props.routes } mode='horizontal' /> }
        <Switch>
          { this.props.routes.slice(0).reverse().map(item => typeof item.component === 'function' ? (
              <Route path={ item.path }
                key={ item.path }
                exact={ item.exact }
                component={ item.component } />
              ) : (
              <Route path={ item.path }
                key={ item.path }
                exact={ item.exact }
                render={ () => item.component } />
              )) }
        </Switch>
      </div>
    );
  }

}
