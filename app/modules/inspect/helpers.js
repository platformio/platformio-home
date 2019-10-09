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

import humanize from 'humanize';

export function formatSize(size) {
  return humanize.filesize(size, 1024, size % 1024 === 0 || size < 1024 ? 0 : 1);
}

export function safeFormatSize(size) {
  return size !== undefined ? formatSize(size) : '';
}

export function formatHex(addr, options) {
  const { width } = options || {};
  let result = addr.toString(16).toUpperCase();
  if (width) {
    result = result.padStart(width, '0');
   }
   return `0x${result}`;
}

export function multiSort(...sorters) {
  return function(a, b) {
    for (let i = 0; i < sorters.length; i++) {
      const result = sorters[i](a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
}

export function compareNumber(a, b) {
  return a - b;
}

export function compareString(a, b) {
  return String(a).localeCompare(b, undefined, {
    caseFirst: 'upper',
    numeric: true
  });
}

export function compareBool(a, b) {
  return a - b;
}
