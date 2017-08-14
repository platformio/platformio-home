/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export const sep = navigator && navigator.platform && navigator.platform.startsWith('Win')? '\\' : '/';

export function join(...paths) {
  return paths.join(sep);
}

export function dirname(path) {
  if (!path.includes(sep) || path === sep) {
    return path;
  }
  let dirname = path.substr(0, path.lastIndexOf(sep));
  while (dirname.endsWith(sep)) {
    dirname = dirname.substr(0, dirname.length - 1);
  }
  return dirname;
}

export function basename(path, ext=undefined) {
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
