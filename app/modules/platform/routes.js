/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
    icon: 'desktop',
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
    path: '/platforms/installed',
    icon: 'hdd',
    label: 'Installed',
    component: PlatformInstalledPage
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
