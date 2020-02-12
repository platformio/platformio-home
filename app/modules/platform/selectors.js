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

import * as helpers from '../core/helpers';

import { selectInputValue } from '../../store/selectors';

// Data Filters
export const BOARDS_INPUT_FILTER_KEY = 'boardsFilter';
export const FRAMEWORKS_INPUT_FILTER_KEY = 'frameworksFilter';
export const EMBEDDED_INPUT_FILTER_KEY = 'platformEmebddedFilter';
export const DESKTOP_INPUT_FILTER_KEY = 'platformDesktopFilter';
export const INSTALLED_INPUT_FILTER_KEY = 'platformInstalledFilter';
export const UPDATES_INPUT_FILTER_KEY = 'platformUpdatesFilter';

export function selectBoardsFilter(state) {
  return selectInputValue(state, BOARDS_INPUT_FILTER_KEY);
}

export function selectFrameworksFilter(state) {
  return selectInputValue(state, FRAMEWORKS_INPUT_FILTER_KEY);
}

export function selectEmbeddedFilter(state) {
  return selectInputValue(state, EMBEDDED_INPUT_FILTER_KEY);
}

export function selectDesktopFilter(state) {
  return selectInputValue(state, DESKTOP_INPUT_FILTER_KEY);
}

export function selectInstalledFilter(state) {
  return selectInputValue(state, INSTALLED_INPUT_FILTER_KEY);
}

export function selectUpdatesFilter(state) {
  return selectInputValue(state, UPDATES_INPUT_FILTER_KEY);
}

// Entities

export function selectBoards(state) {
  return state.entities.boards || null;
}

export function selectRegistryPackages(state) {
  return state.entities.registryPackages || null;
}

export function selectRegistryPlatforms(state) {
  return state.entities.registryPlatforms || null;
}

export function selectRegistryFrameworks(state) {
  return state.entities.registryFrameworks || null;
}

export function selectInstalledPlatforms(state) {
  return state.entities.installedPlatforms || null;
}

export function selectPlatformUpdates(state) {
  return state.entities.platformUpdates || null;
}

export function selectInstalledPlatformsData(state) {
  return state.entities.installedPlatformsData || null;
}

export function selectInstalledPlatformData(state, nameAndVersion) {
  const items = selectInstalledPlatformsData(state);
  if (!items) {
    return null;
  }
  return items.find(item => `${item.name}@${item.version}` === nameAndVersion);
}

// Expanders

export function expandFrameworksOrPlatforms(state, what, items) {
  if (!items.length || typeof items[0] !== 'string') {
    return items;
  }
  const data =
    (what === 'platforms'
      ? selectRegistryPlatforms(state)
      : selectRegistryFrameworks(state)) || [];
  if (items.length && items[0] === '*') {
    return data.map(item => {
      return {
        name: item.name,
        title: item.title
      };
    });
  }
  return items.map(name => {
    let title = helpers.title(name);
    for (const d of data) {
      if (d.name === name) {
        title = d.title;
      }
    }
    return {
      name,
      title
    };
  });
}

export function expandRegistryPackages(state, items) {
  if (!items.length || typeof items[0] !== 'string') {
    return items;
  }
  const packages = selectRegistryPackages(state);
  return items.map(name => {
    if (!packages) {
      return {
        name
      };
    }
    return {
      name: name,
      url: packages[name].url,
      description: packages[name].description
    };
  });
}

// Filtered selectors

export function selectNormalizedBoards(state) {
  const items = selectBoards(state);
  if (!items) {
    return null;
  }
  return items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.platform = expandFrameworksOrPlatforms(state, 'platforms', [
      newItem.platform
    ])[0];
    newItem.frameworks = expandFrameworksOrPlatforms(
      state,
      'frameworks',
      newItem.frameworks
    );
    return newItem;
  });
}

export function selectVisibleEmbeddedPlatforms(state) {
  const filterValue = selectEmbeddedFilter(state);
  let items = selectRegistryPlatforms(state);
  if (!items) {
    return null;
  }
  items = items.filter(item => !item.forDesktop);
  items = items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.frameworks = expandFrameworksOrPlatforms(
      state,
      'frameworks',
      newItem.frameworks
    );
    return newItem;
  });
  if (!filterValue) {
    return items;
  }
  return helpers.fuzzySearch(items, filterValue, 'name');
}

export function selectVisibleDesktopPlatforms(state) {
  const filterValue = selectDesktopFilter(state);
  let items = selectRegistryPlatforms(state);
  if (!items) {
    return null;
  }
  items = items.filter(item => item.forDesktop);
  items = items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.frameworks = expandFrameworksOrPlatforms(
      state,
      'frameworks',
      newItem.frameworks
    );
    return newItem;
  });
  if (!filterValue) {
    return items;
  }
  return helpers.fuzzySearch(items, filterValue, 'name');
}

export function selectPlatformData(state, name) {
  let data = null;
  if (name.includes('@')) {
    data = selectInstalledPlatformData(state, name);
  } else {
    data = (selectRegistryPlatforms(state) || []).find(item => item.name === name);
  }
  if (!data) {
    return null;
  }

  data = Object.assign({}, data);

  if (data.frameworks && data.frameworks.length) {
    data.frameworks = expandFrameworksOrPlatforms(state, 'frameworks', data.frameworks);
  }
  if (data.packages && data.packages.length) {
    data.packages = expandRegistryPackages(state, data.packages);
  }
  // if platform from a registry
  if (!data.boards) {
    const boards = selectBoards(state);
    if (boards) {
      data.boards = boards
        .filter(item => item.platform === data.name)
        .map(item => Object.assign({}, item));
    }
  }

  // make titled frameworks and platforms
  if (data.boards) {
    data.boards = data.boards.map(item => {
      item.platform = expandFrameworksOrPlatforms(state, 'platforms', [
        item.platform
      ])[0];
      item.frameworks = expandFrameworksOrPlatforms(
        state,
        'frameworks',
        item.frameworks
      );
      return item;
    });
  }

  return data;
}

export function selectFrameworkData(state, name) {
  let data = (selectRegistryFrameworks(state) || []).find(item => item.name === name);
  if (!data) {
    return null;
  }
  data = Object.assign({}, data);

  if (data.platforms && data.platforms.length) {
    data.platforms = expandFrameworksOrPlatforms(state, 'platforms', data.platforms);
  }

  const boards = selectBoards(state);
  if (boards) {
    data.boards = boards
      .filter(item => item.frameworks.includes(data.name))
      .map(item => Object.assign({}, item));
    // make titled frameworks and platforms
    data.boards = data.boards.map(item => {
      item.platform = expandFrameworksOrPlatforms(state, 'platforms', [
        item.platform
      ])[0];
      item.frameworks = expandFrameworksOrPlatforms(
        state,
        'frameworks',
        item.frameworks
      );
      return item;
    });
  }

  return data;
}

export function selectVisibleInstalledPlatforms(state) {
  const filterValue = selectInstalledFilter(state);
  let items = selectInstalledPlatforms(state);
  if (!items) {
    return null;
  }
  items = items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.frameworks = expandFrameworksOrPlatforms(
      state,
      'frameworks',
      newItem.frameworks
    );
    return newItem;
  });
  if (!filterValue) {
    return items;
  }
  return helpers.fuzzySearch(items, filterValue, 'name');
}

export function selectVisiblePlatformUpdates(state) {
  const filterValue = selectUpdatesFilter(state);
  let items = selectPlatformUpdates(state);
  if (!items) {
    return null;
  }
  items = items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.frameworks = expandFrameworksOrPlatforms(
      state,
      'frameworks',
      newItem.frameworks
    );
    return newItem;
  });
  if (!filterValue) {
    return items;
  }
  return helpers.fuzzySearch(items, filterValue, 'name');
}

export function selectVisibleFrameworks(state) {
  const filterValue = selectFrameworksFilter(state);
  let items = selectRegistryFrameworks(state);
  if (!items) {
    return null;
  }
  items = items.map(item => {
    const newItem = Object.assign({}, item);
    newItem.platforms = expandFrameworksOrPlatforms(
      state,
      'platforms',
      newItem.platforms
    );
    return newItem;
  });
  if (!filterValue) {
    return items;
  }
  return helpers.fuzzySearch(items, filterValue, 'name');
}
