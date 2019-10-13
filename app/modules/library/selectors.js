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

import { LibraryStorage, filterStorageItems } from './storage';
import {
  expandFrameworksOrPlatforms,
  selectRegistryFrameworks,
  selectRegistryPlatforms
} from '../platform/selectors';
import { selectInputValue } from '../../store/selectors';

import { selectProjects } from '../project/selectors';

// Data Filters
export const BUILTIN_INPUT_FILTER_KEY = 'libBuiltinFilter';
export const INSTALLED_INPUT_FILTER_KEY = 'libInstalledFilter';
export const UPDATES_INPUT_FILTER_KEY = 'libUpdatesFilter';

export function selectBuiltinFilter(state) {
  return selectInputValue(state, BUILTIN_INPUT_FILTER_KEY);
}

export function selectInstalledFilter(state) {
  return selectInputValue(state, INSTALLED_INPUT_FILTER_KEY);
}

export function selectUpdatesFilter(state) {
  return selectInputValue(state, UPDATES_INPUT_FILTER_KEY);
}

export function selectStoreSearchKey(query, page = 0) {
  return [query, page].join();
}

export function selectSearchResults(state) {
  return state.entities.libSearch || null;
}

export function selectSearchResult(state, query, page = 1) {
  const items = selectSearchResults(state);
  if (!items) {
    return null;
  }
  const item = items.find(item => item.key === selectStoreSearchKey(query, page));
  return item ? item.result : null;
}

export function selectStats(state) {
  return state.entities.libStats || null;
}

export function selectRegistryLibs(state) {
  return state.entities.registryLibs || null;
}

export function selectRegistryLib(state, id) {
  const items = selectRegistryLibs(state);
  if (!items) {
    return null;
  }
  return items.find(item => item.id === id) || null;
}

export function selectLibraryData(state, idOrManifest) {
  if (typeof idOrManifest === 'number') {
    return selectRegistryLib(state, parseInt(idOrManifest));
  } else if (!selectRegistryPlatforms(state) || !selectRegistryFrameworks(state)) {
    return null;
  }

  const data = Object.assign({}, idOrManifest);
  // fix platforms and frameworks
  for (const key of ['platforms', 'frameworks']) {
    if (
      !data[key] ||
      data[key].length === 0 ||
      (typeof data[key][0] === 'object' && data[key][0].name)
    ) {
      continue;
    }
    data[key] = expandFrameworksOrPlatforms(state, key, data[key]);
  }

  // fix repository url
  if (data.repository && data.repository.url) {
    data.repository = data.repository.url;
  }

  // missed fields
  for (const key of ['authors', 'frameworks', 'platforms', 'keywords']) {
    data[key] = data[key] || [];
  }
  return data;
}

export function selectBuiltinLibs(state) {
  return state.entities.builtinLibs || null;
}

export function selectVisibletBuiltinLibs(state) {
  const filterValue = selectBuiltinFilter(state);
  let items = selectBuiltinLibs(state);
  if (!items) {
    return null;
  }
  items = items
    .filter(data => data.items.length)
    .map(data => new LibraryStorage(data.name, data.path, data.items));
  if (!filterValue) {
    return items;
  }
  return filterStorageItems(items, filterValue);
}

export function selectLibraryStorages(state) {
  const projects = selectProjects(state) || [];
  const items = [];
  projects.forEach(project => {
    if (project.envLibStorages) {
      project.envLibStorages.forEach(storage => {
        items.push(
          new LibraryStorage(`Project: ${project.name} > ${storage.name}`, storage.path)
        );
      });
    }
    project.extraLibStorages.forEach(storage => {
      items.push(new LibraryStorage(`Storage: ${storage.name}`, storage.path));
    });
  });

  items.push(new LibraryStorage('Global storage'));
  return items;
}

export function selectInstalledLibs(state) {
  return selectLibraryStorages(state).map(storage => {
    const key = `installedLibs${storage.initialPath}`;
    if (state.entities[key]) {
      storage.items = state.entities[key];
    }
    storage.actions = LibraryStorage.ACTION_REVEAL | LibraryStorage.ACTION_UNINSTALL;
    return storage;
  });
}

export function selectVisibleInstalledLibs(state) {
  const filterValue = selectInstalledFilter(state);
  const items = selectInstalledLibs(state);
  if (!items) {
    return null;
  } else if (!filterValue) {
    return items;
  }
  return filterStorageItems(items, filterValue);
}

export function selectLibUpdates(state) {
  return selectLibraryStorages(state).map(storage => {
    const key = `libUpdates${storage.initialPath}`;
    if (state.entities[key]) {
      storage.items = state.entities[key];
    }
    storage.actions = LibraryStorage.ACTION_REVEAL | LibraryStorage.ACTION_UPDATE;
    return storage;
  });
}

export function selectVisibleLibUpdates(state) {
  const filterValue = selectUpdatesFilter(state);
  const items = selectLibUpdates(state);
  if (!items) {
    return null;
  } else if (!filterValue) {
    return items;
  }
  return filterStorageItems(items, filterValue);
}
