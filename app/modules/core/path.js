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

import { IS_WINDOWS } from '../../config';

export const sep = IS_WINDOWS ? '\\' : '/';

export function join(...paths) {
  return paths
    .map((item, index) =>
      item.endsWith(sep) || index === paths.length - 1 ? item : `${item}${sep}`
    )
    .join('');
}

export function dirname(path) {
  if (!path || !path.includes(sep) || path === sep) {
    return path;
  }
  let dirname = path.substr(0, path.lastIndexOf(sep));
  while (dirname.endsWith(sep)) {
    dirname = dirname.substr(0, dirname.length - 1);
  }
  return dirname;
}

export function basename(path, ext = undefined) {
  if (!path) {
    return path;
  }
  let basename = path;
  if (path.includes(sep) && path !== sep) {
    basename = path.substr(path.lastIndexOf(sep));
    while (basename.startsWith(sep)) {
      basename = basename.substr(1);
    }
  }
  if (ext && basename.endsWith(ext)) {
    return basename.substr(0, basename.length - ext.length);
  }
  return basename;
}

export function extname(path) {
  if (!path.includes('.')) {
    return '';
  }
  return path.substr(path.lastIndexOf('.'));
}

export function normalize(path) {
  if (sep === '\\') {
    return path.replace('/', '\\');
  }
  return path.replace('\\', '/');
}

export function commonprefix(paths) {
  if (!paths || !paths.length) {
    return '';
  }
  let common = [];
  let tmp = [];
  for (let i = 0; i < paths[0].length; i++) {
    const char = paths[0][i];
    for (let j = 0; j < paths.length; j++) {
      const item = paths[j];
      if (i > item.length || item[i] !== char) {
        return common.join('');
      }
    }
    if (char === '\\' || char === '/') {
      common = common.concat(tmp);
      tmp = [];
    }
    tmp.push(char);
  }
  return common.join('');
}

export function split(path) {
  return path.split(sep).filter(item => item.length);
}
