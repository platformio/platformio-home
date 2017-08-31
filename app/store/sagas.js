/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition, no-case-declarations */

import * as actions from './actions';

import { call, fork, put, select, takeLatest } from 'redux-saga/effects';

import { INPUT_FILTER_DELAY } from '../config';
import accountSagas from '../modules/account/sagas';
import { apiFetchData } from './api';
import { asyncDelay } from '../modules/core/helpers';
import coreSagas from '../modules/core/sagas';
import librarySagas from '../modules/library/sagas';
import { notifyError } from '../modules/core/actions';
import platformSagas from '../modules/platform/sagas';
import projectSagas from '../modules/project/sagas';
import telemetrySagas from './telemetry';

function* watchLoadStore() {
  yield takeLatest(actions.LOAD_STORE, function*() {
    try {
      const newState = yield call(apiFetchData, {
        query: 'app.loadState'
      });
      yield put(actions.updateStore(newState));
      yield put(actions.fireStoreReady());
    } catch (err) {
      return yield put(notifyError('Could not load lastest application state', err));
    }
  });
}

function* autoSaveState() {
  const keysForSave = ['inputValues', 'storage'];
  const triggerActions = [
    actions.SAVE_STATE,
    actions.UPDATE_INPUT_VALUE,
    actions.UPDATE_STORAGE_ITEM,
    actions.DELETE_STORAGE_ITEM
  ];
  yield takeLatest(triggerActions, function*(action) {
    if (action.type !== actions.SAVE_STATE) {
      yield call(asyncDelay, 5000);
    }
    try {
      const state = yield select();
      const savedState = {};
      keysForSave.forEach(key => {
        if (state.hasOwnProperty(key)) {
          savedState[key] = state[key];
        }
      });

      const result = yield call(apiFetchData, {
        query: 'app.saveState',
        params: [savedState]
      });
      if (!result) {
        throw new Error('Received invalid result after saving application state');
      }
    } catch (err) {
      return yield put(notifyError('Could not save application state', err));
    }
  });
}

function* watchLazyUpdateInputValue() {
  yield takeLatest(actions.LAZY_UPDATE_INPUT_VALUE, function*({key, value}) {
    yield call(asyncDelay, INPUT_FILTER_DELAY);
    yield put(actions.updateInputValue(key, value));
  });
}

export default function* root() {
  yield[
    watchLoadStore,
    autoSaveState,
    watchLazyUpdateInputValue,
    ...telemetrySagas,
    ...accountSagas,
    ...coreSagas,
    ...librarySagas,
    ...projectSagas,
    ...platformSagas
  ].map(item => fork(item));
}
