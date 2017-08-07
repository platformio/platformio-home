/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AccountForgotPage from './containers/forgot-page';
import AccountLoginPage from './containers/login-page';
import AccountMainPage from './containers/information-page';
import AccountRegistrationPage from './containers/registration-page';
import PasswordPage from './containers/password-page';
import TokenPage from './containers/token-page';


const routes = [
  {
    path: '/account',
    icon: 'info-circle-o',
    label: 'Information',
    component: AccountMainPage
  },
  {
    path: '/account/login',
    component: AccountLoginPage
  },
  {
    path: '/account/registration',
    component: AccountRegistrationPage
  },
  {
    path: '/account/forgot',
    component: AccountForgotPage
  },
  {
    path: '/account/password',
    icon: 'lock',
    label: 'Password',
    component: PasswordPage
  },
  {
    path: '/account/token',
    icon: 'key',
    label: 'Token',
    component: TokenPage
  }
];

export default routes;
