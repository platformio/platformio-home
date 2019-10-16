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

import { call, put, select, takeLatest } from 'redux-saga/effects';

import { INSPECTION_KEY } from '@inspect/constants';
import { INSPECT_PROJECT } from './actions';
import { apiFetchData } from '@store/api';
import { goTo } from '@core/helpers';
import { notifyError } from '@core/actions';
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
      let codeCheckResult;
      if (force) {
        yield put(
          updateEntity(INSPECTION_KEY, {
            meta: { ...meta, status: 'generating' },
            data: undefined
          })
        );
        yield call(apiFetchData, {
          query: 'core.call',
          params: [['run', '-d', projectDir, '-e', env, '-t', 'sizedata']]
        });

        if (inspectCode) {
          const codeCheckResults = yield call(apiFetchData, {
            query: 'core.call',
            params: [['check', '-d', projectDir, '-e', env, '--json-output']]
          });
          if (codeCheckResults && codeCheckResults.length) {
            codeCheckResult = codeCheckResults[0];
          }
        }
      }

      const buildDir = yield call(apiFetchData, {
        query: 'project.config_call',
        params: [
          pathlib.join(projectDir, 'platformio.ini'),
          'get_optional_dir',
          'build'
        ]
      });
      const uri = pathlib.join(buildDir, env, 'sizedata.json');
      yield put(updateEntity(INSPECTION_KEY, { meta: { ...meta, status: 'reading' } }));

      const jsonContent = yield call(apiFetchData, {
        query: 'os.request_content',
        params: [uri]
      });
      const data = JSON.parse(jsonContent);
      if (codeCheckResult) {
        data.codeCheck = codeCheckResult;
      }

      yield put(
        updateEntity(INSPECTION_KEY, { data, meta: { ...meta, status: 'ready' } })
      );

      const state = yield select();
      if (state.router) {
        goTo(state.router.history, '/inspect/result/stats', undefined, true);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        yield put(
          updateEntity(INSPECTION_KEY, {
            meta: { ...meta, status: 'error', error: 'Bad JSON' }
          })
        );
      } else {
        yield put(
          updateEntity(INSPECTION_KEY, {
            meta: { ...meta, status: 'error', error: 'Exception' }
          })
        );
      }
      yield put(notifyError('Sorry, error encountered during Inspection', err));
    }
  });
}

export default [watchInspectProject];
