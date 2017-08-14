/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { createAction } from '../../store/actions';


export const ADD_PROJECT = 'HIDE_PADDCT';
export const HIDE_PROJECT = 'HIDE_PROJECT';
export const OPEN_PROJECT = 'OPEN_PROJECT';
export const LOAD_PROJECTS = 'LOAD_PROJECTS';

export const addProject = path => createAction(ADD_PROJECT, { path });
export const hideProject = path => createAction(HIDE_PROJECT, { path });
export const openProject = path => createAction(OPEN_PROJECT, { path });
export const loadProjects = () => createAction(LOAD_PROJECTS);

