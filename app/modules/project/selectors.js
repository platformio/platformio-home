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

import { CONFIG_SCHEMA_KEY, PROJECT_CONFIG_KEY } from '@project/constants';
import { selectEntity, selectInputValue } from '@store/selectors';

import fuzzaldrin from 'fuzzaldrin-plus';

export const INPUT_FILTER_KEY = 'projectFilter';

export function selectFilter(state) {
  return selectInputValue(state, INPUT_FILTER_KEY);
}

export function selectProjects(state) {
  return selectEntity(state, 'projects');
}

export function selectProjectExamples(state) {
  return selectEntity(state, 'projectExamples');
}

export function selectVisibleProjects(state) {
  const filterValue = selectFilter(state);
  const items = selectProjects(state);
  if (!items) {
    return null;
  } else if (!filterValue) {
    return items.sort((a, b) => b.modified - a.modified);
  }
  return fuzzaldrin.filter(
    items.map(item => {
      item._fuzzy = [item.path, JSON.stringify(item.boards)].join(' ');
      return item;
    }),
    filterValue,
    {
      key: '_fuzzy'
    }
  );
}

export function selectProjectInfo(state, path) {
  return (selectProjects(state) || []).find(item => item.path === path);
}

export function selectConfigSchema(state) {
  return selectEntity(state, CONFIG_SCHEMA_KEY);
}

export function selectProjectConfig(state) {
  return selectEntity(state, PROJECT_CONFIG_KEY);
}
