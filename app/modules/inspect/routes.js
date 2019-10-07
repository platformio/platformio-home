/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import InspectExplorerPage from './containers/memory-explorer-page';

const routes = [
  {
    path: '/inspect',
    icon: 'cluster',
    label: 'Explorer',
    component: InspectExplorerPage
  }
];

export default routes;
