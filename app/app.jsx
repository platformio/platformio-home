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

import { Button, Layout, Tooltip } from 'antd';
import { Route, Switch } from 'react-router-dom';

import AccountStatusBar from './modules/account/containers/status-bar';
import AppFooter from './footer';
import CompanyLogo from './modules/home/components/company-logo';
import OpenInBrowser from './modules/core/containers/open-in-browser';
import PropTypes from 'prop-types';
import React from 'react';
import RoutedMenu from './modules/core/containers/routed-menu';
import SocialButtons from './modules/core/containers/social-buttons';
import routes from './routes';

export default class App extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  renderHeader() {
    const router = this.context.router;
    return (
      <div className="header-container">
        <table cellPadding="0" cellSpacing="0" width="100%">
          <tbody>
            <tr>
              <td>
                <ul className="list-inline">
                  <li>
                    <Button.Group>
                      <Button
                        icon="left"
                        title="Go Back"
                        disabled={
                          router.history.length < 1 || router.history.index === 0
                        }
                        onClick={() => router.history.goBack()}
                      ></Button>
                      <Button
                        icon="right"
                        title="Go Forward"
                        disabled={
                          router.history.length < 1 ||
                          router.history.index >= router.history.length - 1
                        }
                        onClick={() => router.history.goForward()}
                      ></Button>
                    </Button.Group>
                  </li>
                  <li>
                    <OpenInBrowser />
                  </li>
                  <li>
                    <SocialButtons />
                  </li>
                </ul>
              </td>
              <td className="account-bar text-right">
                {<AccountStatusBar router={router} />}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    return (
      <Layout hasSider className="app-container">
        <Layout.Sider width={64}>
          <div className="logo">
            <Tooltip placement="right" title="Reload Home">
              <a href={window.location.href}>
                <CompanyLogo width="32px" height="32px" />
              </a>
            </Tooltip>
          </div>
          <RoutedMenu router={this.context.router} routes={routes} theme={'dark'} />
        </Layout.Sider>
        <Layout className="main-container">
          <Layout.Header>{this.renderHeader()}</Layout.Header>
          <Layout.Content>
            <Switch>
              {routes
                .slice(0)
                .reverse()
                .map(item => (
                  <Route
                    path={item.path}
                    key={item.path}
                    exact={item.exact}
                    component={item.component}
                  />
                ))}
            </Switch>
          </Layout.Content>
          <AppFooter />
        </Layout>
      </Layout>
    );
  }
}
