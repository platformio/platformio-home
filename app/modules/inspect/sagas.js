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

import { ENVS_KEY, FORM_KEY, RESULT_KEY } from '@inspect/constants';
import { INSPECT_PROJECT, LOAD_PROJECT_ENVS, SAVE_INSPECT_FORM } from './actions';
import { call, put, takeLatest } from 'redux-saga/effects';
import { deleteEntity, patchEntity, updateEntity } from '@store/actions';

import { apiFetchData } from '@store/api';
import { generateInspectionResultKey } from '@inspect/helpers';
// import { goTo } from '@core/helpers';
// import { notifyError } from '@core/actions';

function* inspectMemory({ projectDir, env }, resultKey) {
  yield call(apiFetchData, {
    query: 'core.call',
    params: [['run', '-d', projectDir, '-e', env, '-t', 'sizedata']]
  });
  const buildDir = yield call(apiFetchData, {
    query: 'project.config_call',
    params: [pathlib.join(projectDir, 'platformio.ini'), 'get_optional_dir', 'build']
  });

  // const defaultEnvs = yield call(apiFetchData, {
  //   query: 'project.config_call',
  //   params: [pathlib.join(projectDir, 'platformio.ini'), 'default_envs']
  // });

  // FIXME: fails! invalid dir!
  // const uri = pathlib.join(buildDir, env, 'sizedata.json');
  const uri = pathlib.join(projectDir, '.pio', 'build', env, 'sizedata.json');

  const jsonContent = yield call(apiFetchData, {
    query: 'os.request_content',
    params: [uri]
  });
  const memoryData = JSON.parse(jsonContent);
  yield put(patchEntity(resultKey, { memory: memoryData.memory }, {}));
}

function* inspectCode({ projectDir, env }, resultKey) {
  const codeCheckResults = yield call(apiFetchData, {
    query: 'core.call',
    params: [['check', '-d', projectDir, '-e', env, '--json-output']]
  });
  let codeCheck;
  if (codeCheckResults && codeCheckResults.length) {
    codeCheck = codeCheckResults[0];
  }
  yield put(patchEntity(resultKey, { codeCheck }, {}));
}

function* watchInspectProject() {
  yield takeLatest(INSPECT_PROJECT, function*(args) {
    const { projectDir, env, flags, force } = args;
    const resultKey = generateInspectionResultKey(
      projectDir,
      env,
      flags.memory,
      flags.code
    );

    yield put(deleteEntity(new RegExp(`^${resultKey}$`)));
    yield put(updateEntity(RESULT_KEY, resultKey));
    yield put(patchEntity(resultKey, undefined, { ...args, status: 'generating' }));

    try {
      const parallelTasks = [];
      if (force && flags.memory) {
        // parallelTasks.push(call(inspectMemory, args, resultKey));
        yield call(inspectMemory, args, resultKey);
      }
      if (force && flags.code) {
        // parallelTasks.push(call(inspectCode, args, resultKey));
        yield call(inspectCode, args, resultKey);
      }
      // FIXME: gives JsonRPC error 4003
      // yield all(parallelTasks);
      // FIXME: doesn't run at all
      // yield parallelTasks;

      yield put(patchEntity(resultKey, {}, { status: 'ready' }));
      // const state = yield select();
      // if (state.router) {
      //   goTo(state.router.history, '/inspect/result/stats', undefined, true);
      // }
    } catch (err) {
      if (err instanceof SyntaxError) {
        yield put(
          patchEntity(
            resultKey,
            {},
            {
              status: 'error',
              error: 'Bad JSON'
            }
          )
        );
      } else {
        yield put(
          patchEntity(
            resultKey,
            {},
            {
              status: 'error',
              error: 'Exception'
            }
          )
        );
      }
      // yield put(notifyError('Sorry, error encountered during Inspection', err));
    }
  });
}

function* watchLoadProjectEnvs() {
  yield takeLatest(LOAD_PROJECT_ENVS, function*({ projectPath }) {
    const environments = yield call(apiFetchData, {
      query: 'project.config_call',
      params: [pathlib.join(projectPath, 'platformio.ini'), 'envs']
    });
    yield put(updateEntity(ENVS_KEY, environments));
  });
}

function* watchSaveInspectForm() {
  yield takeLatest(SAVE_INSPECT_FORM, function*({ data }) {
    yield put(updateEntity(FORM_KEY, data));
  });
}

export default [watchInspectProject, watchLoadProjectEnvs, watchSaveInspectForm];
