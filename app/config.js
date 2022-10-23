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

import { select, takeLatest } from 'redux-saga/effects';
import { STORE_READY } from './store/actions';
import { selectStorage } from './store/selectors';

export function* watchLoadIsWindows() {
  yield takeLatest(STORE_READY, function* () {
    const storage = yield select(selectStorage);
    if (!storage.coreSystype) {
      return;
    }
    IS_WINDOWS = storage.coreSystype.indexOf('windows') > -1;
  });
};

export let IS_WINDOWS;

export const INPUT_FILTER_DELAY = 300; // ms, dalay before filtering projects, libs, platorms
export const PLATFORMIO_API_ENDPOINT = 'https://api.platformio.org';

let pathname = window.location ? window.location.pathname : '/';
if (pathname[pathname.length - 1] !== '/') {
  pathname += '/';
}
let wsrpc = `ws://127.0.0.1:8008${pathname}wsrpc`;
if (process.env.NODE_ENV === 'production' && window.location && window.location.host) {
  wsrpc = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
    window.location.host
  }${pathname}wsrpc`;
}
export const BACKEND_ENDPOINT = wsrpc;
