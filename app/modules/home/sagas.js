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

import { call, put, select, takeLatest } from 'redux-saga/effects';

import { apiFetchData } from '../../store/api';
import { updateEntity } from '../../store/actions';

function* watchLoadLatestTweets() {
  yield takeLatest(actions.LOAD_LATEST_TWEETS, function*({ username }) {
    let items = yield select(selectors.selectLatestTweets);
    if (items) {
      return;
    }
    try {
      items = yield call(apiFetchData, {
        query: 'misc.load_latest_tweets',
        params: [`https://dl.platformio.org/tweets/${username}/data.json`]
      });
    } catch (err1) {
      console.error(err1);
      // FIXME: Remove this code after PIO Core 4.1.1 release (begin)
      try {
        const cacheValid = '1d';
        items = JSON.parse(
          yield call(apiFetchData, {
            query: 'os.request_content',
            params: [
              `https://dl.platformio.org/tweets/${username}/data.json`,
              undefined,
              undefined,
              cacheValid
            ]
          })
        );
        // fallvback to backend cache
        items = items.result ? items.result : items;
      } catch (err2) {
        console.error(err2);
        items = err2;
      }
      // FIXME: Remove this code after PIO Core 4.1.1 release (end)
    }
    yield put(updateEntity('latestTweets', items));
  });
}

export default [watchLoadLatestTweets];
