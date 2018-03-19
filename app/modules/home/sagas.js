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

import { call, put, select, take } from 'redux-saga/effects';

import { apiFetchData } from '../../store/api';
import { notifyError } from '../core/actions';
import { updateEntity } from '../../store/actions';


function* watchLoadLatestTweets() {
  while (true) {
    const { username }  = yield take(actions.LOAD_LATEST_TWEETS);
    let items = yield select(selectors.selectLatestTweets);
    if (items) {
      continue;
    }
    try {
      items = yield call(apiFetchData, {
        query: 'misc.load_latest_tweets',
        params: [username]
      });
      yield put(updateEntity('latestTweets', items));
    } catch (err) {
      yield put(notifyError('Could not load latest Tweets', err));
    }
  }
}

export default [
  watchLoadLatestTweets
];
