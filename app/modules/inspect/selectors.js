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

import { JSON_URL } from './containers/memory-explorer-page';
import { selectRequestedContent } from '@core/selectors';

function selectProjectSizeData(state) {
  // return state.entities.projectSizeData || {};
  return JSON.parse(selectRequestedContent(state, JSON_URL)) || {};
}

export function selectSizeDataForPath(state, dirPath = '') {
  let files = (selectProjectSizeData(state).memory || {}).files;
  if (files === undefined) {
    return undefined;
  }
  if (!files.length) {
    files = Object.entries(files).map(([k, v]) => ({
      ...v,
      path: k.replace(/\//g, '\\')
    }));
  }
  return files.map(v => ({
    flash: v.flash_size,
    isDir: false,
    path: v.path,
    ram: v.ram_size,
    symbols: (v.symbols || []).map(s => ({
      ...s,
      displayName: s.demangled_name !== undefined ? s.demangled_name : s.name
    }))
  }));
}
