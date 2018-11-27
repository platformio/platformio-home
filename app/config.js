/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export const INPUT_FILTER_DELAY = 300; // ms, dalay before filtering projects, libs, platorms
export const PLATFORMIO_API_ENDPOINT = 'http://api.platformio.org';
export const PIOPLUS_API_ENDPOINT = 'https://api.pioplus.com';
export const PIOPLUS_UPGRADE_COUPON = 'HOME13V5OFF15';

let wsrpc = 'ws://127.0.0.1:8008/wsrpc';
if (process.env.NODE_ENV === 'production' && window.location && window.location.host) {
  wsrpc = `ws://${window.location.host}/wsrpc`;
}
export const BACKEND_ENDPOINT = wsrpc;
