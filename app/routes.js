/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AccountIndex from './modules/account/index';
import BoardsPage from './modules/platform/containers/boards-page';
import DevicePage from './modules/device/index';
import HomePage from './modules/home/containers/home-page';
import LibraryIndex from './modules/library/index';
import PlatformPage from './modules/platform/index';


const routes = [
  {
    path: '/',
    icon: 'home',
    label: 'Home',
    component: HomePage
  },
  {
    path: '/account',
    icon: 'user',
    label: 'Account',
    component: AccountIndex
  },
  {
    path: '/libraries',
    icon: 'book',
    label: 'Libraries',
    component: LibraryIndex
  },
  {
    path: '/boards',
    icon: 'calculator',
    label: 'Boards',
    component: BoardsPage
  },
  {
    path: '/platforms',
    icon: 'desktop',
    label: 'Platforms',
    component: PlatformPage
  },
  {
    path: '/device',
    icon: 'usb',
    label: 'Devices',
    component: DevicePage
  }
];

export default routes;
