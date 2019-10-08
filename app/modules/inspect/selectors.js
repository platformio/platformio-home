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

import * as pathlib from '@core/path';

import {selectRequestedContent} from '@core/selectors';

function selectProjectSizeData(state) {
  // return state.entities.projectSizeData || {};
  return JSON.parse(selectRequestedContent(state, 'http://dl.platformio.org/tmp/sizedata-tasmota.json')) || {};
}

export function selectSizeDataForPath(state, dirPath='') {
  const files = (selectProjectSizeData(state).memory || {}).files;
  if (files === undefined) {
    return undefined;
  }
  return files.map(v => ({
    flash: v.flash_size,
    isDir: false,
    path: pathlib.ensureLeadingSlash(v.path),
    ram: v.ram_size
  }));
}
