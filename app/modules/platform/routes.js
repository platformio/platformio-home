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

import FrameworkDetailPage from './containers/framework-page';
import FrameworksPage from './containers/frameworks-page';
import PlatformDesktopPage from './containers/desktop-page';
import PlatformDetailPage from './containers/platform-page';
import PlatformEmbeddedPage from './containers/embedded-page';
import PlatformInstalledPage from './containers/installed-page';
import PlatformUpdatesPage from './containers/updates-page';

const routes = [
  {
    path: '/platforms',
    icon: 'hdd',
    label: 'Installed',
    component: PlatformInstalledPage
  },
  {
    path: '/platforms/installed',
    component: PlatformInstalledPage
  },
  {
    path: '/platforms/embedded',
    icon: 'build',
    label: 'Embedded',
    component: PlatformEmbeddedPage
  },
  {
    path: '/platforms/desktop',
    icon: 'desktop',
    label: 'Desktop',
    component: PlatformDesktopPage
  },
  {
    path: '/platforms/frameworks',
    icon: 'setting',
    label: 'Frameworks',
    component: FrameworksPage
  },
  {
    path: '/platforms/frameworks/show',
    component: FrameworkDetailPage
  },
  {
    path: '/platforms/updates',
    icon: 'cloud-download-o',
    label: 'Updates',
    component: PlatformUpdatesPage
  },
  {
    path: '/platforms/embedded/show',
    component: PlatformDetailPage
  },
  {
    path: '/platforms/desktop/show',
    component: PlatformDetailPage
  },
  {
    path: '/platforms/installed/show',
    component: PlatformDetailPage
  }
];

export default routes;
