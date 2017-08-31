/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { createAction } from '../../store/actions';


export const ADD_PROJECT = 'ADD_PROJECT';
export const HIDE_PROJECT = 'HIDE_PROJECT';
export const OPEN_PROJECT = 'OPEN_PROJECT';
export const IMPORT_PROJECT = 'IMPORT_PROJECT';
export const LOAD_PROJECTS = 'LOAD_PROJECTS';
export const PROJECTS_LOADED = 'PROJECTS_LOADED';
export const INIT_PROJECT = 'INIT_PROJECT';
export const IMPORT_ARDUINO_PROJECT = 'IMPORT_ARDUINO_PROJECT';
export const LOAD_PROJECT_EXAMPLES = 'LOAD_PROJECT_EXAMPLES';

export const addProject = projectDir => createAction(ADD_PROJECT, { projectDir });
export const hideProject = projectDir => createAction(HIDE_PROJECT, { projectDir });
export const openProject = projectDir => createAction(OPEN_PROJECT, { projectDir });
export const importProject = (projectDir, onEnd=undefined) => createAction(IMPORT_PROJECT, { projectDir, onEnd });
export const loadProjects = () => createAction(LOAD_PROJECTS);
export const projectsLoaded = () => createAction(PROJECTS_LOADED);
export const initProject = (board, framework, projectDir, onEnd=undefined) => createAction(INIT_PROJECT, { board, framework, projectDir, onEnd });
export const importArduinoProject = (board, useArduinoLibs, arduinoProjectDir, onEnd=undefined) => createAction(IMPORT_ARDUINO_PROJECT, { board, useArduinoLibs, arduinoProjectDir, onEnd });
export const loadProjectExamples = () => createAction(LOAD_PROJECT_EXAMPLES);
