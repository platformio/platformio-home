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

export const PROJECT_CONFIG_KEY = 'projectConfig';
export const CONFIG_SCHEMA_KEY = 'projectConfigSchema';

export const TYPE_TEXT = 'string';
export const TYPE_CHOICE = 'choice';
export const TYPE_INT = 'integer';
export const TYPE_INT_RANGE = 'integer range';
export const TYPE_BOOL = 'boolean';
export const TYPE_FILE = 'file';

export const TYPES = Object.freeze([
  TYPE_TEXT,
  TYPE_CHOICE,
  TYPE_INT,
  TYPE_INT_RANGE,
  TYPE_BOOL,
  TYPE_FILE
]);

export const SCOPE_PLATFORMIO = 'platformio';
export const SCOPE_ENV = 'env';
export const SCOPES = Object.freeze([SCOPE_PLATFORMIO, SCOPE_ENV]);

export const SECTION_PLATFORMIO = 'platformio';
export const SECTION_GLOBAL_ENV = 'env';
export const SECTION_USER_ENV = 'env:';
export const SECTION_CUSTOM = 'custom';

export const SECTION_NAME_KEY = '__section';

export const SECTIONS = Object.freeze([
  SECTION_PLATFORMIO,
  SECTION_GLOBAL_ENV,
  SECTION_USER_ENV,
  SECTION_CUSTOM
]);
