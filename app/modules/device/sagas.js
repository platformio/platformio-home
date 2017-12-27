/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import * as actions from './actions';
import * as selectors from './selectors';

import { call, put, select, take } from 'redux-saga/effects';
import { deleteEntity, updateEntity } from '../../store/actions';

import { apiFetchData } from '../../store/api';
import { notifyError } from '../core/actions';


function* watchLoadSerialDevices() {
  while (true) {
    const { force } = yield take(actions.LOAD_SERIAL_DEVICES);
    if (force) {
      yield put(deleteEntity(/^serialDevices/));
    }
    let items = yield select(selectors.selectSerialDevices);
    if (items) {
      return;
    }
    yield call(function*() {
      try {
        items = yield call(apiFetchData, {
          query: 'core.call',
          params: [['device', 'list', '--serial', '--json-output']]
        });
        yield put(updateEntity('serialDevices', items));
      } catch (err) {
        yield put(notifyError('Could not load serial devices', err));
      }
    });
  }
}

function* watchLoadMDNSDevices() {
  while (true) {
    const { force } = yield take(actions.LOAD_MDNS_DEVICES);
    if (force) {
      yield put(deleteEntity(/^mDNSDevices/));
    }
    let items = yield select(selectors.selectMDNSDevices);
    if (items) {
      return;
    }
    yield call(function*() {
      try {
        items = yield call(apiFetchData, {
          query: 'core.call',
          params: [['device', 'list', '--mdns', '--json-output']]
        });
        yield put(updateEntity('mDNSDevices', items));
      } catch (err) {
        yield put(notifyError('Could not load mDNS services', err));
      }
    });
  }
}

export default [
  watchLoadSerialDevices,
  watchLoadMDNSDevices
];
