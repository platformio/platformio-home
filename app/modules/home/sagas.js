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

import { STORE_READY, updateEntity } from '../../store/actions';
import { call, put, select, take, takeLatest } from 'redux-saga/effects';

import { apiFetchData } from '../../store/api';
import { selectStorageItem } from '../../store/selectors';


function* watchLoadLatestTweets() {
  yield takeLatest(actions.LOAD_LATEST_TWEETS, function*({username}) {
    let items = yield select(selectors.selectLatestTweets);
    if (items) {
      return;
    }
    // if storage is not loaded yet, wait and don't block other calls
    // 'load_latest_tweets' blocks HOME's backend
    if (!(yield select(selectStorageItem, 'coreVersion'))) {
      yield take(STORE_READY);
    }
    try {
      items = yield call(apiFetchData, {
        query: 'misc.load_latest_tweets',
        params: [username]
      });
    } catch (err) {
      items = err;
      console.error(err);
    }
    yield put(updateEntity('latestTweets', items));
  });
}

export default [
  watchLoadLatestTweets
];
