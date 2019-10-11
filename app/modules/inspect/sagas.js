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

import * as pathlib from '@core/path';

import { call, put, takeLatest } from 'redux-saga/effects';

import { INSPECTION_KEY } from '@inspect/constants';
import { INSPECT_PROJECT } from './actions';
import { apiFetchData } from '@store/api';
import { updateEntity } from '@store/actions';

function* watchInspectProject() {
  yield takeLatest(INSPECT_PROJECT, function*({
    projectDir,
    environments,
    inspectCode,
    force
  }) {
    const env = environments[0];
    const meta = {
      projectDir,
      env
    };
    try {
      if (force) {
        yield put(
          updateEntity(INSPECTION_KEY, { meta: { ...meta, state: 'generating' } })
        );
        const runResult = yield call(apiFetchData, {
          query: 'core.call',
          params: [['run', '-d', projectDir, '-e', env, '-t', 'sizedata']]
        });
      }
      yield put(updateEntity(INSPECTION_KEY, { meta: { ...meta, state: 'reading' } }));
      // TODO: setup passing router into saga context to access router from saga
      // see https://github.com/ReactTraining/react-router/issues/3972#issuecomment-251189856
      // yield put(push());

      const uri = pathlib.join(projectDir, '.pio', 'build', env, 'sizedata.json');
      const jsonContent = yield call(apiFetchData, {
        query: 'os.request_content',
        params: [uri]
      });
      const data = JSON.parse(jsonContent);
      yield put(
        updateEntity(INSPECTION_KEY, { data, meta: { ...meta, state: 'ready' } })
      );

    } catch (err) {
      if (err instanceof SyntaxError) {
        yield put(
          updateEntity(INSPECTION_KEY, {
            meta: { ...meta, state: 'error', error: 'Bad JSON' }
          })
        );
      } else {
        yield put(
          updateEntity(INSPECTION_KEY, {
            meta: { ...meta, state: 'error', error: 'Exception' }
          })
        );
      }
      console.error('Failed to run and get sizedata.json', err);
    }
  });
}

export default [watchInspectProject];
