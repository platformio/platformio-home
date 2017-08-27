/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export const INPUT_FILTER_DELAY = 300; // ms, dalay before filtering projects, libs, platorms
export const CHECK_CORE_UPDATES_INTERVAL = 86400 * 3;  // seconds, 3 days
export const PLATFORMIO_API_ENDPOINT = 'http://api.platformio.org';
export const PIOPLUS_API_ENDPOINT = 'https://api.pioplus.com';

let wsrpc = 'http://127.0.0.1:8008/wsrpc';
if (process.env.NODE_ENV === 'production' && window.location && window.location.origin) {
  wsrpc = `${window.location.origin}/wsrpc`;
}
export const BACKEND_ENDPOINT = wsrpc;
