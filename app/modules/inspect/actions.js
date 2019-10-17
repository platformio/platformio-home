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

import { createAction } from '@store/actions';

export const INSPECT_PROJECT = 'INSPECT_PROJECT';
export const LOAD_PROJECT_ENVS = 'LOAD_PROJECTS_ENVS';

export const SAVE_INSPECT_FORM = 'SAVE_INSPECT_FORM';

export function inspectProject(projectDir, env, flags, force = true) {
  return createAction(INSPECT_PROJECT, {
    projectDir,
    env,
    flags,
    force
  });
}

export function loadProjectEnvironments(projectPath) {
  return createAction(LOAD_PROJECT_ENVS, {
    projectPath
  });
}

export function saveInspectForm(data) {
  return createAction(SAVE_INSPECT_FORM, { data });
}
