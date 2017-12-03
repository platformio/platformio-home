/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { selectStorageItem } from '../../store/selectors';
import shajs from 'sha.js';


export function selectShowAtStartup(state) {
  const caller = selectStorageItem(state, 'coreCaller');
  if (!caller) {
    return true;
  }
  const data = selectStorageItem(state, 'showOnStartup');
  return !data || !data.hasOwnProperty(caller) || data[caller];
}

export function getRequestContentKey(uri, data=undefined) {
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

export function selectRequestedContent(state, uri, data=undefined) {
  const items = selectRequestedContents(state) || [];
  for (const item of items) {
    if (item.key === getRequestContentKey(uri, data)) {
      return item.content;
    }
  }
  return null;
}

export function selectOsFSGlobKey(pathnames, rootDir=undefined) {
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

export function selectOsFSGlob(state, pathnames, rootDir=undefined) {
  const globs = selectOsFSGlobs(state) || [];
  for (const glob of globs) {
    if (glob.key === selectOsFSGlobKey(pathnames, rootDir)) {
      return glob.items;
    }
  }
  return null;
}

export function selectLogicalDisks(state) {
  return state.entities.logicalDisks;
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
  return Object.keys(items).map(key => ({path: key, count: items[key]}));
}
