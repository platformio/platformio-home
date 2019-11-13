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

import AccountIndex from './modules/account/index';
import BoardsPage from './modules/platform/containers/boards-page';
import DevicePage from './modules/device/index';
import HomePage from './modules/home/containers/home-page';
import InspectPage from './modules/inspect';
import LibraryIndex from './modules/library/index';
import PlatformPage from './modules/platform/index';
import ProjectsPage from './modules/project';

const routes = [
  {
    path: '/',
    icon: 'home',
    label: 'Home',
    component: HomePage
  },
  {
    path: '/account',
    // icon: 'user',
    // label: 'Account',
    component: AccountIndex
  },
  {
    path: '/projects',
    icon: 'file-ppt',
    label: 'Projects',
    component: ProjectsPage
  },
  {
    path: '/inspect',
    icon: 'monitor',
    label: 'Inspect',
    component: InspectPage
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
    icon: 'appstore',
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
