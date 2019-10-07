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
