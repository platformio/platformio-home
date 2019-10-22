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
export const PREFIX = 'inspect';

// Entity name to save list of environments
export const CONFIG_KEY = PREFIX + 'Configuration';

export const RESULT_KEY = PREFIX + 'Sizedata';

export const SYMBOL_ICON_BY_TYPE = Object.freeze({
  STT_FUNC: 'profile',
  STT_OBJECT: 'tag'
});

export const SYMBOL_NAME_BY_TYPE = Object.freeze({
  STT_FUNC: 'Function',
  STT_OBJECT: 'Variable'
});

export const SEVERITY_LEVEL = Object.freeze({
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
});

export const SEVERITY_LEVEL_NAME = {
  [SEVERITY_LEVEL.HIGH]: 'High',
  [SEVERITY_LEVEL.MEDIUM]: 'Medium',
  [SEVERITY_LEVEL.LOW]: 'Low'
};
