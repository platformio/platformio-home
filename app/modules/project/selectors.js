/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { selectEntity, selectInputValue } from '../../store/selectors';

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
  return fuzzaldrin.filter(items.map(item => {
    item._fuzzy = [
      item.path,
      JSON.stringify(item.boards)
    ].join(' ');
    return item;
  }), filterValue, {
    key: '_fuzzy'
  });
}
