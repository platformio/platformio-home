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

export const NOTIFY_ERROR = 'NOTIFY_ERROR';
export const NOTIFY_SUCCESS = 'NOTIFY_SUCCESS';

export const UPDATE_ROUTE_BADGE = 'UPDATE_ROUTE_BADGE';
export const SHOW_AT_STARTUP = 'SHOW_AT_STARTUP';

export const OS_OPEN_URL = 'OS_OPEN_URL';
export const OS_REVEAL_FILE = 'OS_REVEAL_FILE';
export const OS_RENAME_FILE = 'OS_RENAME_FILE';
export const OS_COPY_FILE = 'OS_COPY_FILE';
export const OS_MAKE_DIRS = 'OS_MAKE_DIRS';
export const OS_LIST_DIR = 'OS_LIST_DIR';
export const OS_IS_FILE = 'OS_IS_FILE';
export const OS_IS_DIR = 'OS_IS_DIR';
export const OS_FS_GLOB = 'OS_FS_GLOB';

export const REQUEST_CONTENT = 'REQUEST_CONTENT';
export const LOAD_LOGICAL_DEVICES = 'LOAD_LOGICAL_DEVICES';
export const RESET_FS_ITEMS = 'RESET_FS_ITEMS';
export const TOGGLE_FAVORITE_FOLDER = 'TOGGLE_FAVORITE_FOLDER';
export const OPEN_TEXT_DOCUMENT = 'OPEN_TEXT_DOCUMENT';

export const notifyError = (title, err) => createAction(NOTIFY_ERROR, { title, err });
export const notifySuccess = (title, result) =>
  createAction(NOTIFY_SUCCESS, { title, result });

export const updateRouteBadge = (path, count) =>
  createAction(UPDATE_ROUTE_BADGE, { path, count });
export const showAtStartup = (value) => createAction(SHOW_AT_STARTUP, { value });

export const osOpenUrl = (url) => createAction(OS_OPEN_URL, { url });
export const osRevealFile = (path) => createAction(OS_REVEAL_FILE, { path });
export const osRenameFile = (src, dst) => createAction(OS_RENAME_FILE, { src, dst });
export const osCopyFile = (src, dst) => createAction(OS_COPY_FILE, { src, dst });
export const osMakeDirs = (path) => createAction(OS_MAKE_DIRS, { path });
export const osListDir = (path) => createAction(OS_LIST_DIR, { path });
export const osIsFile = (path) => createAction(OS_IS_FILE, { path });
export const osIsDir = (path) => createAction(OS_IS_DIR, { path });
export const osFsGlob = (pathnames, rootDir = undefined) =>
  createAction(OS_FS_GLOB, { pathnames, rootDir });

export const requestContent = ({
  uri,
  data = undefined,
  headers = undefined,
  cacheValid = undefined,
}) => createAction(REQUEST_CONTENT, { uri, data, headers, cacheValid });
export const loadLogicalDevices = (force = false) =>
  createAction(LOAD_LOGICAL_DEVICES, { force });
export const resetFSItems = () => createAction(RESET_FS_ITEMS);
export const toggleFavoriteFolder = (path) =>
  createAction(TOGGLE_FAVORITE_FOLDER, { path });
export const openTextDocument = (path, line = undefined, column = undefined) =>
  createAction(OPEN_TEXT_DOCUMENT, { path, line, column });
