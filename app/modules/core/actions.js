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

export const OPEN_URL = 'OPEN_URL';
export const REVEAL_FILE = 'REVEAL_FILE';
export const FS_GLOB = 'FS_GLOB';
export const REQUEST_CONTENT = 'REQUEST_CONTENT';


export const notifyError = (title, err) => createAction(NOTIFY_ERROR, { title, err });
export const notifySuccess = (title, result) => createAction(NOTIFY_SUCCESS, { title, result });

export const sendFeedback = (body, onEnd=undefined) => createAction(SEND_FEEDBACK, { body, onEnd });
export const updateRouteBadge = (path, count) => createAction(UPDATE_ROUTE_BADGE, { path, count });

export const openUrl = (url) => createAction(OPEN_URL, { url });
export const revealFile = (path) => createAction(REVEAL_FILE, { path });
export const fsGlob = (pathnames, rootDir=undefined) => createAction(FS_GLOB, { pathnames, rootDir });
export const requestContent = (uri, data=undefined) => createAction(REQUEST_CONTENT, { uri, data });
