/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
export const loadSearchResult = (query, page=1) => createAction(LOAD_SEARCH_RESULT, { query, page });
export const loadLibraryData = idOrManifest => createAction(LOAD_LIBRARY_DATA, { idOrManifest });
export const loadBuiltinLibs = () => createAction(LOAD_BUILTIN_LIBS);
export const loadInstalledLibs = () => createAction(LOAD_INSTALLED_LIBS);
export const loadLibUpdates = () => createAction(LOAD_LIB_UPDATES);

export const installLibrary = ( storageDir, lib, onEnd=null) => createAction(INSTALL_LIBRARY, { storageDir, lib, onEnd });
export const uninstallLibrary = (storageDir, pkgDir, onEnd=null) => createAction(UNINSTALL_LIBRARY, { storageDir, pkgDir, onEnd });
export const updateLibrary = (storageDir, pkgDir, onEnd=null) => createAction(UPDATE_LIBRARY, { storageDir, pkgDir, onEnd });
