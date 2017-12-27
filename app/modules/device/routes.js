/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import DeviceLogicalPage from './containers/logical-page';
import DeviceMDNSPage from './containers/mdns-page';
import DeviceSerialPage from './containers/serial-page';


const routes = [
  {
    path: '/device',
    icon: 'usb',
    label: 'Serial',
    component: DeviceSerialPage
  },
  {
    path: '/device/logical',
    icon: 'hdd',
    label: 'Logical',
    component: DeviceLogicalPage
  },
  {
    path: '/device/mdns',
    icon: 'wifi',
    label: 'Multicast DNS',
    component: DeviceMDNSPage
  }
];

export default routes;
