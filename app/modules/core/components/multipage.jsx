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

import { Route, Switch } from 'react-router-dom';

import PropTypes from 'prop-types';
import React from 'react';
import RoutedMenu from '../containers/routed-menu';

export default class MultiPage extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
    disableMenu: PropTypes.bool,
  };

  render() {
    return (
      <div>
        {!this.props.disableMenu && (
          <RoutedMenu
            router={this.context.router}
            routes={this.props.routes}
            mode="horizontal"
          />
        )}
        <Switch>
          {this.props.routes
            .slice(0)
            .reverse()
            .map((item) =>
              typeof item.component === 'function' ? (
                <Route
                  path={item.path}
                  key={item.path}
                  exact={item.exact}
                  component={item.component}
                />
              ) : (
                <Route
                  path={item.path}
                  key={item.path}
                  exact={item.exact}
                  render={() => item.component}
                />
              )
            )}
        </Switch>
      </div>
    );
  }
}
