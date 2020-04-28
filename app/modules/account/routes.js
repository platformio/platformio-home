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

import AccountForgotPage from './containers/forgot-page';
import AccountLoginPage from './containers/login-page';
import AccountMainPage from './containers/information-page';
import AccountRegistrationPage from './containers/registration-page';
import PasswordPage from './containers/password-page';
import ProfilePage from './containers/profile-page';
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
    path: '/account/profile',
    icon: 'user',
    label: 'Profile',
    component: ProfilePage
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
