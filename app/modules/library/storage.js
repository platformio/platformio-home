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

import * as path from '../core/path';

import { fuzzySearch } from '@core/helpers';

export class LibraryStorage {
  static ACTION_REVEAL = 1;
  static ACTION_UNINSTALL = 2;
  static ACTION_UPDATE = 4;
  static ACTION_ALL = 8;

  constructor(
    name,
    path = undefined,
    items = undefined,
    actions = undefined,
    options = undefined
  ) {
    this.name = name;
    this.path = path;
    this.initialPath = path;
    this._items = items;
    this._actions = actions || LibraryStorage.ACTION_REVEAL;
    this.options = options || {};
  }

  get items() {
    return this._items;
  }

  set items(items) {
    if (items && items.length && !this.path) {
      this.path = path.dirname(items[0].__pkg_dir);
    }
    this._items = items;
  }

  get actions() {
    return this._actions;
  }

  set actions(actions) {
    if (typeof actions === 'number' && actions <= LibraryStorage.ACTION_ALL) {
      this._actions = actions;
    }
  }
}

export function filterStorageItems(storages, filterValue) {
  return storages.map((storage) => {
    let items = storage.items;
    if (items && filterValue) {
      items = fuzzySearch(items, filterValue, 'name');
    }
    return new LibraryStorage(
      storage.name,
      storage.path,
      items,
      storage.actions,
      storage.options
    );
  });
}
