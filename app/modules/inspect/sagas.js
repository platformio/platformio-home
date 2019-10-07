/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import * as actions from './actions';

import { put, takeLatest } from 'redux-saga/effects';
import { updateEntity } from '@store/actions';


function* watchTmpDatasize() {
  yield takeLatest(actions.TMP_SAVE_DATASIZE_JSON, function*(data) {
    yield put(updateEntity('projectSizeData', data || {}));
  });
}

export default [
  watchTmpDatasize,
];
