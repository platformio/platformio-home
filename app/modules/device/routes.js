/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import DeviceLocalPage from './containers/local-page';


const routes = [
  {
    path: '/device',
    icon: 'usb',
    label: 'Local',
    component: DeviceLocalPage
  }
];

export default routes;
