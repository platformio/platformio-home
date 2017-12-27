/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function selectSerialDevices(state) {
  return state.entities.serialDevices || null;
}

export function selectMDNSDevices(state) {
  return state.entities.mDNSDevices || null;
}
