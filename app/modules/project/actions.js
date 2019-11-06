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

export const ADD_PROJECT = 'ADD_PROJECT';
export const HIDE_PROJECT = 'HIDE_PROJECT';
export const OPEN_PROJECT = 'OPEN_PROJECT';
export const IMPORT_PROJECT = 'IMPORT_PROJECT';
export const LOAD_PROJECTS = 'LOAD_PROJECTS';
export const PROJECTS_LOADED = 'PROJECTS_LOADED';
export const INIT_PROJECT = 'INIT_PROJECT';
export const IMPORT_ARDUINO_PROJECT = 'IMPORT_ARDUINO_PROJECT';
export const LOAD_PROJECT_EXAMPLES = 'LOAD_PROJECT_EXAMPLES';
export const LOAD_CONFIG_SCHEMA = 'LOAD_CONFIG_SCHEMA';
export const LOAD_PROJECT_CONFIG = 'LOAD_PROJECT_CONFIG';
export const SAVE_PROJECT_CONFIG = 'SAVE_PROJECT_CONFIG';

export const UPDATE_CONFIG_DESCRIPTION = 'UPDATE_CONFIG_DESCRIPTION';

export const addProject = (projectDir, withOpen = true, onEnd) =>
  createAction(ADD_PROJECT, { projectDir, withOpen, onEnd });
export const hideProject = projectDir => createAction(HIDE_PROJECT, { projectDir });
export const openProject = projectDir => createAction(OPEN_PROJECT, { projectDir });
export const importProject = (projectDir, onEnd = undefined) =>
  createAction(IMPORT_PROJECT, { projectDir, onEnd });
export const loadProjects = force => createAction(LOAD_PROJECTS, { force });
export const projectsLoaded = () => createAction(PROJECTS_LOADED);
export const initProject = (board, framework, projectDir, onEnd = undefined) =>
  createAction(INIT_PROJECT, { board, framework, projectDir, onEnd });
export const importArduinoProject = (
  board,
  useArduinoLibs,
  arduinoProjectDir,
  onEnd = undefined
) =>
  createAction(IMPORT_ARDUINO_PROJECT, {
    board,
    useArduinoLibs,
    arduinoProjectDir,
    onEnd
  });
export const loadProjectExamples = () => createAction(LOAD_PROJECT_EXAMPLES);

export const loadConfigSchema = () => createAction(LOAD_CONFIG_SCHEMA);

export const loadProjectConfig = projectDir =>
  createAction(LOAD_PROJECT_CONFIG, { projectDir });

export const saveProjectConfig = (projectDir, data, onEnd) =>
  createAction(SAVE_PROJECT_CONFIG, { projectDir, data, onEnd });

export const updateConfigDescription = (projectDir, description, onEnd) =>
  createAction(UPDATE_CONFIG_DESCRIPTION, { projectDir, description, onEnd });
