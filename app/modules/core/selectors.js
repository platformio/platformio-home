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

import { selectStorageItem } from '../../store/selectors';
import shajs from 'sha.js';

export function selectShowAtStartup(state) {
  const caller = selectStorageItem(state, 'coreCaller');
  if (!caller) {
    return true;
  }
  const data = selectStorageItem(state, 'showOnStartup');
  return !data || !Object.prototype.hasOwnProperty.call(data, caller) || data[caller];
}

export function getRequestContentKey(uri, data = undefined) {
  const hash = shajs('sha1');
  hash.update(uri);
  if (data) {
    hash.update(JSON.stringify(data));
  }
  return hash.digest('hex');
}

export function selectRequestedContents(state) {
  return state.entities.requestedContents;
}

export function selectRequestedContent(state, uri, data = undefined) {
  const items = selectRequestedContents(state) || [];
  for (const item of items) {
    if (item.key === getRequestContentKey(uri, data)) {
      return item.content;
    }
  }
  return null;
}

export function selectOsFSGlobKey(pathnames, rootDir = undefined) {
  const hash = shajs('sha1');
  hash.update(pathnames.join());
  if (rootDir) {
    hash.update(rootDir);
  }
  return hash.digest('hex');
}

export function selectOsFSGlobs(state) {
  return state.entities.osFsGlob;
}

export function selectOsFSGlob(state, pathnames, rootDir = undefined) {
  const globs = selectOsFSGlobs(state) || [];
  for (const glob of globs) {
    if (glob.key === selectOsFSGlobKey(pathnames, rootDir)) {
      return glob.items;
    }
  }
  return null;
}

export function selectLogicalDevices(state) {
  return state.entities.logicalDevices;
}

export function selectOsDirItems(state) {
  return state.entities.osDirItems;
}

export function selectOsIsFileItems(state) {
  return state.entities.osIsFileItems;
}

export function selectOsIsDirItems(state) {
  return state.entities.osIsDirItems;
}

export function selectRouteBadges(state) {
  const items = selectStorageItem(state, 'routeBadges') || {};
  return Object.keys(items).map(key => ({ path: key, count: items[key] }));
}
