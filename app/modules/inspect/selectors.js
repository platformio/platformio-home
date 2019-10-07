/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function selectProjectSizeData(state) {
  return state.entities.projectSizeData || {};
}

export function selectSizeDataForPath(state, dirPath='') {
  const files = (selectProjectSizeData(state).memory || {}).files;
  if (files === undefined) {
    return undefined;
  }
  return Object.entries(files).map(([k, v]) => ({
    path: k,
    isDir: false,
    flashSize: v.flash_size,
    ramSize: v.ram_size
  }));
}
