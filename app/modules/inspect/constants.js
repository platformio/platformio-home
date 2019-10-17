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

//  Prefix for names of entities
export const PREFIX = 'projectInspection';
export const RESULT_KEY = PREFIX + 'Result';
// Entity name to save list of environments
export const ENVS_KEY = PREFIX + 'Envs';
export const FORM_KEY = PREFIX + 'Form';
export const SYMBOL_ICON_BY_TYPE = Object.freeze({
  STT_FUNC: 'profile',
  STT_OBJECT: 'tag'
});

export const SYMBOL_NAME_BY_TYPE = Object.freeze({
  STT_FUNC: 'Function',
  STT_OBJECT: 'Variable'
});
