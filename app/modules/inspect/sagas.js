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

/* eslint-disable no-constant-condition */

import * as actions from './actions';

import { call, put, takeLatest } from 'redux-saga/effects';

import { apiFetchData } from '@store/api';
import jsonrpc from 'jsonrpc-lite';
import { notifyError } from '../core/actions';
import {  updateEntity } from '@store/actions';


function* watchLoadProjectSizeData() {
  yield takeLatest(actions.LOAD_PROJECT_SIZE_DATA, function*({projectDir}) {
    let data;
    try {
      data = yield call(apiFetchData, {
        query: 'core.call',
        params: [['@TODO']]
      });
    } catch (err) {
      if (!(err instanceof jsonrpc.JsonRpcError && err.data.includes('`pio account login`'))) {
        yield put(notifyError('Could not load PIO Account information', err));
      }
    }
    yield put(updateEntity('projectSizeData', data || {}));
  });
}

export default [
  watchLoadProjectSizeData,
];
