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

/* eslint-disable no-constant-condition, no-case-declarations */

import * as actions from './actions';

import { all, call, put, select, takeLatest } from 'redux-saga/effects';

import { INPUT_FILTER_DELAY } from '../config';
import accountSagas from '../modules/account/sagas';
import { apiFetchData } from './api';
import { asyncDelay } from '../modules/core/helpers';
import coreSagas from '../modules/core/sagas';
import deviceSagas from '../modules/device/sagas';
import homeSagas from '../modules/home/sagas';
import inspectSagas from '../modules/inspect/sagas';
import librarySagas from '../modules/library/sagas';
import { notifyError } from '../modules/core/actions';
import platformSagas from '../modules/platform/sagas';
import projectSagas from '../modules/project/sagas';
import telemetrySagas from './telemetry';

function* watchLoadStore() {
  yield takeLatest(actions.LOAD_STORE, function*() {
    try {
      const newState = yield call(apiFetchData, {
        query: 'app.get_state'
      });
      if (newState['inputValues']) {
        delete newState['inputValues'];
      }
      yield put(actions.updateStore(newState));
      yield put(actions.fireStoreReady());
    } catch (err) {
      return yield put(notifyError('Could not load lastest application state', err));
    }
  });
}

function* autoSaveState() {
  const triggerActions = [
    actions.SAVE_STATE,
    actions.UPDATE_STORAGE_ITEM,
    actions.DELETE_STORAGE_ITEM
  ];
  yield takeLatest(triggerActions, function*(action) {
    if (action.type !== actions.SAVE_STATE) {
      yield call(asyncDelay, 2000);
    }
    try {
      const state = (yield select()) || {};
      const savedState = {
        storage: Object.assign({}, state.storage)
      };
      // don't serialize PIO Core Settings
      if (savedState.storage.coreSettings) {
        delete savedState.storage.coreSettings;
      }
      const result = yield call(apiFetchData, {
        query: 'app.save_state',
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
  yield takeLatest(actions.LAZY_UPDATE_INPUT_VALUE, function*({ key, value }) {
    yield call(asyncDelay, INPUT_FILTER_DELAY);
    yield put(actions.updateInputValue(key, value));
  });
}

export default function* root() {
  yield all(
    [
      watchLoadStore,
      autoSaveState,
      watchLazyUpdateInputValue,
      ...telemetrySagas,
      ...accountSagas,
      ...coreSagas,
      ...deviceSagas,
      ...homeSagas,
      ...librarySagas,
      ...projectSagas,
      ...platformSagas,
      ...inspectSagas
    ].map(s => s())
  );
}
