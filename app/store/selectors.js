/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function selectEntity(state, key) {
  const items = state.entities || {};
  if (!items.hasOwnProperty(key)) {
    return null;
  }
  return items[key];
}

export function selectInputValue(state, key) {
  const data = state.inputValues || {};
  if (!data.hasOwnProperty(key)) {
    return null;
  }
  return data[key];
}

export function selectStorage(state) {
  return state.storage || {};
}

export function selectStorageItem(state, key) {
  const items = selectStorage(state);
  if (!items.hasOwnProperty(key)) {
    return null;
  }
  return items[key];
}
