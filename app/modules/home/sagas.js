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
import * as selectors from './selectors';

import { STORE_READY, updateEntity } from '../../store/actions';
import { call, put, select, take, takeLatest } from 'redux-saga/effects';

import { apiFetchData } from '../../store/api';
import { selectStorageItem } from '../../store/selectors';

function* watchLoadLatestTweets() {
  yield takeLatest(actions.LOAD_LATEST_TWEETS, function*({ username }) {
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
        params: [`https://dl.platformio.org/tweets/${username}/data.json`]
      });
    } catch (err) {
      items = err;
      console.error(err);
    }
    yield put(updateEntity('latestTweets', items));
  });
}

export default [watchLoadLatestTweets];
