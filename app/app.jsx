/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import './media/styles/index.scss';
import { Button, Col, Layout, LocaleProvider, Row, Tooltip } from 'antd';
import { Route, Switch } from 'react-router';

import AccountStatusBar from './modules/account/containers/status-bar';
import Feedback from './modules/core/containers/feedback';
import OpenInBrowser from './modules/core/containers/open-in-browser';
import PlatformIOLogo from './modules/home/components/pio-logo';
import PropTypes from 'prop-types';
import React from 'react';
import RoutedMenu from './modules/core/containers/routed-menu';
import enUS from 'antd/lib/locale-provider/en_US';
import routes from './routes';


export default class App extends React.Component {

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  renderHeader() {
    const router = this.context.router;
    return (
      <Row>
        <Col span={ 6 }>
          <ul className='list-inline'>
            <li>
              <Button.Group>
                <Button icon='left' title='Go Back' disabled={ router.history.length < 1 || router.history.index === 0 } onClick={ () => router.history.goBack() }></Button>
                <Button icon='right' title='Go Forward' disabled={ router.history.length < 1 || router.history.index >= (router.history.length - 1) } onClick={ () => router.history.goForward() }></Button>
              </Button.Group>
            </li>
            <li><Feedback /></li>
            <li><OpenInBrowser /></li>
          </ul>
        </Col>
        <Col span={ 18 } className='account-bar text-right'>
          { <AccountStatusBar router={ router } /> }
        </Col>
      </Row>
      );
  }

  render() {
    const {Content, Header, Sider} = Layout;
    return (
      <LocaleProvider locale={ enUS }>
        <Layout className='app-container'>
          <Layout>
            <Sider width={ 70 }>
              <div className='logo'>
                <Tooltip placement='right' title='PlatformIO Home'>
                  <a href='/'>
                    <PlatformIOLogo width='32px' height='32px' />
                  </a>
                </Tooltip>
              </div>
              <RoutedMenu router={ this.context.router } routes={ routes } theme={ 'dark' } />
            </Sider>
            <Layout className='main-container'>
              <Header>{ this.renderHeader() }</Header>
              <Content>
                <Switch>
                  { routes.slice(0).reverse().map(item => (
                      <Route path={ item.path }
                        key={ item.path }
                        exact={ item.exact }
                        component={ item.component } />
                    )) }
                </Switch>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </LocaleProvider>
      );
  }
}
