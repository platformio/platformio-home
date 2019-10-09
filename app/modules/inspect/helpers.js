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

import { IS_WINDOWS } from '@app/config';
import humanize from 'humanize';

export const PARENT_DIR = '..';
export const CURRENT_DIR = '.';

export function formatSize(size) {
  return humanize.filesize(size, 1024, size % 1024 === 0 || size < 1024 ? 0 : 1);
}

export function safeFormatSize(size) {
  return size !== undefined ? formatSize(size) : '';
}

export function formatHex(addr, options) {
  if (typeof addr !== 'number') {
    return;
  }
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

export function windowsToPosixPath(windowsPath) {
  return windowsPath.replace(/\\/g, '/');
}

export function posixToWindowsPath(windowsPath) {
  return windowsPath.replace(/\//g, '\\');
}

export function fixPathSeparators(path) {
  return IS_WINDOWS ? posixToWindowsPath(path) : windowsToPosixPath(path);
}

export function fixPath(path) {
  return resolveRelativePathSegments(fixPathSeparators(path));
}

export function resolveRelativePathSegments(path, sep = pathlib.sep) {
  const resolved = [];
  for (const part of path.split(sep)) {
    if (part === CURRENT_DIR) {
      continue;
    }
    if (part === PARENT_DIR) {
      if (!resolved.length) {
        throw new Error(`Relative path goes outside of root: ${path}`);
      }
      resolved.pop();
      continue;
    }
    resolved.push(part);
  }
  return resolved.join(sep);
}
