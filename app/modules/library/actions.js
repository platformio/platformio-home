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

import { createAction } from '../../store/actions';

export const LOAD_STATS = 'LOAD_STATS';
export const LOAD_SEARCH_RESULT = 'LOAD_SEARCH_RESULT';
export const LOAD_LIBRARY_DATA = 'LOAD_LIBRARY_DATA';
export const LOAD_BUILTIN_LIBS = 'LOAD_BUILTIN_LIBS';
export const LOAD_INSTALLED_LIBS = 'LOAD_INSTALLED_LIBS';
export const LOAD_LIB_UPDATES = 'LOAD_LIB_UPDATES';

export const INSTALL_LIBRARY = 'INSTALL_LIBRARY';
export const UNINSTALL_LIBRARY = 'UNINSTALL_LIBRARY';
export const UPDATE_LIBRARY = 'UPDATE_LIBRARY';

export const loadStats = () => createAction(LOAD_STATS);
export const loadSearchResult = (query, page = 1, onEnd) =>
  createAction(LOAD_SEARCH_RESULT, { query, page, onEnd });
export const loadLibraryData = idOrManifest =>
  createAction(LOAD_LIBRARY_DATA, { idOrManifest });
export const loadBuiltinLibs = () => createAction(LOAD_BUILTIN_LIBS);
export const loadInstalledLibs = () => createAction(LOAD_INSTALLED_LIBS);
export const loadLibUpdates = () => createAction(LOAD_LIB_UPDATES);

export const installLibrary = (storageDir, lib, onEnd = null) =>
  createAction(INSTALL_LIBRARY, { storageDir, lib, onEnd });
export const uninstallLibrary = (storageDir, pkgDir, onEnd = null) =>
  createAction(UNINSTALL_LIBRARY, { storageDir, pkgDir, onEnd });
export const updateLibrary = (storageDir, pkgDir, onEnd = null) =>
  createAction(UPDATE_LIBRARY, { storageDir, pkgDir, onEnd });
