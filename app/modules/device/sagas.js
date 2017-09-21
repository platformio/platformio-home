/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import * as actions from './actions';

import { call, put, take } from 'redux-saga/effects';
import { deleteEntity, updateEntity } from '../../store/actions';

import { apiFetchData } from '../../store/api';
import { notifyError } from '../core/actions';


function* watchLoadLocalDevices() {
  while (true) {
    yield take(actions.LOAD_LOCAL_DEVICES);
    yield put(deleteEntity(/^localDevices/));
    yield call(function*() {
      try {
        const items = yield call(apiFetchData, {
          query: 'core.call',
          params: [['device', 'list', '--json-output']]
        });
        yield put(updateEntity('localDevices', items));
      } catch (err) {
        yield put(notifyError('Could not load local devices', err));
      }
    });
  }
}

export default [
  watchLoadLocalDevices
];
