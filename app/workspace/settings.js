/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const indexes = {
  'platformio': require('./platformio/index').default,
  'aceinna': require('./aceinna/index').default
};

let workspace = getQueryVariable('workspace');
if (!indexes.hasOwnProperty(workspace)) {
  workspace = 'platformio';
}

export function get(id, defaultValue=undefined) {
  if (indexes[workspace].hasOwnProperty(id)) {
    return indexes[workspace][id];
  }
  return defaultValue;
}

export function getMessage(id) {
  if (indexes[workspace].messages.hasOwnProperty(id)) {
    return indexes[workspace].messages[id];
  }
  return id;
}

export function getUrl(id) {
  return indexes[workspace].urls[id];
}

export function isBoardCertified(board) {
  return board.platform && board.platform.name === 'aceinna_imu';
}
