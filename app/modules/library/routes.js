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
    path: '/libraries/updates',
    icon: 'cloud-download-o',
    label: 'Updates',
    component: LibraryUpdatesPage
  }
];

export default routes;
