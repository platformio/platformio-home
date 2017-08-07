/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import LibraryBuiltinPage from './containers/builtin-page';
import LibraryDetailPage from './containers/detail-page';
import LibraryInstalledPage from './containers/installed-page';
import LibrarySearchPage from './containers/search-page';
import LibraryStatsPage from './containers/stats-page';
import LibraryUpdatesPage from './containers/updates-page';


const routes = [
  {
    path: '/libraries',
    icon: 'book',
    label: 'Registry',
    component: LibraryStatsPage
  },
  {
    path: '/libraries/registry/show',
    component: LibraryDetailPage
  },
  {
    path: '/libraries/registry/search',
    component: LibrarySearchPage
  },
  {
    path: '/libraries/builtin',
    icon: 'eye-o',
    label: 'Built-in',
    component: LibraryBuiltinPage
  },
  {
    path: '/libraries/builtin/show',
    component: LibraryDetailPage
  },
  {
    path: '/libraries/installed',
    icon: 'hdd',
    label: 'Installed',
    component: LibraryInstalledPage
  },
  {
    path: '/libraries/installed/show',
    component: LibraryDetailPage
  },
  {
    path: '/libraries/updates',
    icon: 'cloud-download-o',
    label: 'Updates',
    component: LibraryUpdatesPage
  }
];

export default routes;
