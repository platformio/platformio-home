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
import { fixPath } from '@inspect/helpers';
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
      path: k
    }));
  }
  return files.map(v => ({
    flash: v.flash_size,
    isDir: false,
    path: fixPath(v.path),
    ram: v.ram_size,
    symbols: (v.symbols || []).map(s => ({
      ...s,
      displayName: s.demangled_name !== undefined ? s.demangled_name : s.name
    }))
  }));
}

export function selectSectionsSizeData(state) {
  let { memory: { total: { sections } = {} } = {} } = selectProjectSizeData(state);
  if (sections === undefined) {
    return undefined;
  }
  if (!sections.length) {
    sections = Object.entries(sections).map(([k, v]) => ({
      ...v,
      name: k
    }));
  }
  return sections.map(({ flags, size, type, start_addr: startAddr, name }) => ({
    flags,
    size,
    type,
    startAddr,
    name
  }));
}

export function selectSymbolsSizeData(state) {
  const files = selectSizeDataForPath(state) || [];
  return files
    .map(({ symbols }) => symbols)
    .filter(x => x && x.length)
    .flat();
}
