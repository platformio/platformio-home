/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { createAction } from '../../store/actions';


export const NOTIFY_ERROR = 'NOTIFY_ERROR';
export const NOTIFY_SUCCESS = 'NOTIFY_SUCCESS';

export const SEND_FEEDBACK = 'SEND_FEEDBACK';
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
export const LIST_LOGICAL_DISKS = 'LIST_LOGICAL_DISKS';
export const RESET_FS_ITEMS = 'RESET_FS_ITEMS';
export const TOGGLE_FAVORITE_FOLDER = 'TOGGLE_FAVORITE_FOLDER';

export const notifyError = (title, err) => createAction(NOTIFY_ERROR, { title, err });
export const notifySuccess = (title, result) => createAction(NOTIFY_SUCCESS, { title, result });

export const sendFeedback = (body, onEnd=undefined) => createAction(SEND_FEEDBACK, { body, onEnd });
export const updateRouteBadge = (path, count) => createAction(UPDATE_ROUTE_BADGE, { path, count });
export const showAtStartup = (value) => createAction(SHOW_AT_STARTUP, { value });

export const osOpenUrl = (url) => createAction(OS_OPEN_URL, { url });
export const osRevealFile = (path) => createAction(OS_REVEAL_FILE, { path });
export const osRenameFile = (src, dst) => createAction(OS_RENAME_FILE, { src, dst });
export const osCopyFile = (src, dst) => createAction(OS_COPY_FILE, { src, dst });
export const osMakeDirs = (path) => createAction(OS_MAKE_DIRS, { path });
export const osListDir = (path) => createAction(OS_LIST_DIR, { path });
export const osIsFile = (path) => createAction(OS_IS_FILE, { path });
export const osIsDir = (path) => createAction(OS_IS_DIR, { path });
export const osFsGlob = (pathnames, rootDir=undefined) => createAction(OS_FS_GLOB, { pathnames, rootDir });

export const requestContent = (uri, data=undefined) => createAction(REQUEST_CONTENT, { uri, data });
export const listLogicalDisks = () => createAction(LIST_LOGICAL_DISKS);
export const resetFSItems = () => createAction(RESET_FS_ITEMS);
export const toggleFavoriteFolder = (path) => createAction(TOGGLE_FAVORITE_FOLDER, { path });
