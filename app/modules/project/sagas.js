/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition, no-case-declarations */

import * as actions from './actions';
import * as selectors from './selectors';

import { call, put, select, take, takeEvery } from 'redux-saga/effects';
import { deleteEntity, updateEntity, updateStorageItem } from '../../store/actions';

import { apiFetchData } from '../../store/api';
import { notifyError } from '../core/actions';
import { selectStorageItem } from '../../store/selectors';


const RECENT_PROJECTS_STORAGE_KEY = 'recentProjects';

function* watchAddProject() {
  yield takeEvery(actions.ADD_PROJECT, function*({path}) {
    const result = (yield select(selectStorageItem, RECENT_PROJECTS_STORAGE_KEY)) || [];
    if (result.includes(path)) {
      return;
    }
    yield put(updateStorageItem(RECENT_PROJECTS_STORAGE_KEY, [...result, path]));
    yield put(deleteEntity(/^projects/));
    yield put(actions.loadProjects());
  });
}

function* watchHideProject() {
  yield takeEvery(actions.HIDE_PROJECT, function*({path}) {
    const storageItems = (yield select(selectStorageItem, RECENT_PROJECTS_STORAGE_KEY)) || [];
    const entityItems = (yield select(selectors.selectProjects)) || [];
    yield put(updateStorageItem(RECENT_PROJECTS_STORAGE_KEY, storageItems.filter(item => item !== path)));
    yield put(updateEntity('projects', entityItems.filter(item => item.path !== path)));
  });
}

function* watchOpenProject() {
  // FIXME: Send to middleware
  // yield takeEvery(actions.OPEN_PROJECT, function*({path}) {
  // });
}

function* watchLoadProjects() {
  while (true) {
    yield take(actions.LOAD_PROJECTS);
    let items = yield select(selectors.selectProjects);
    if (items) {
      yield put(actions.projectsLoaded());
      continue;
    }
    try {
      items = yield call(apiFetchData, {
        query: 'app.loadProjects',
        params: [yield select(selectStorageItem, RECENT_PROJECTS_STORAGE_KEY)]
      });
      yield put(updateEntity('projects', items));
      yield put(actions.projectsLoaded());
    } catch (err) {
      yield put(notifyError('Could not load recent projects', err));
    }
  }
}

export default [
  watchAddProject,
  watchHideProject,
  watchOpenProject,
  watchLoadProjects
];
