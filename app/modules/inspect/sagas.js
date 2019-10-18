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

import { CONFIG_KEY, ENVS_KEY, RESULT_KEY } from '@inspect/constants';
import { INSPECT_PROJECT, LOAD_PROJECT_ENVS } from './actions';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { patchEntity, updateEntity } from '@store/actions';

import { apiFetchData } from '@store/api';
import { goTo } from '@core/helpers';
import { selectIsConfigurationDifferent } from '@inspect/selectors';

function* inspectMemory({ projectDir, env }) {
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
  yield put(patchEntity(RESULT_KEY, { memory: memoryData.memory }, {}));
}

function* inspectCode({ projectDir, env }) {
  const codeCheckResults = yield call(apiFetchData, {
    query: 'core.call',
    params: [['check', '-d', projectDir, '-e', env, '--json-output']]
  });
  let codeCheck;
  if (codeCheckResults && codeCheckResults.length) {
    codeCheck = codeCheckResults[0];
  }
  yield put(patchEntity(RESULT_KEY, { codeCheck }, {}));
}

function* watchInspectProject() {
  yield takeLatest(INSPECT_PROJECT, function*({ configuration, force, onEnd }) {
    const { memory, code } = configuration;

    if (!force) {
      const same = yield select(selectIsConfigurationDifferent, configuration);
      if (same) {
        if (onEnd) {
          onEnd();
        }
        return;
      }
    }

    yield put(patchEntity(RESULT_KEY, undefined, { status: 'generating' }));
    try {
      const parallelTasks = [];
      if (memory) {
        // parallelTasks.push(call(inspectMemory, args, resultKey));
        yield call(inspectMemory, configuration);
      }
      if (code) {
        // parallelTasks.push(call(inspectCode, args, resultKey));
        yield call(inspectCode, configuration);
      }
      // FIXME: gives JsonRPC error 4003
      // yield all(parallelTasks);
      // FIXME: doesn't run at all
      // yield parallelTasks;

      yield put(patchEntity(RESULT_KEY, {}, { status: 'ready' }));
      yield put(updateEntity(CONFIG_KEY, configuration));
      const state = yield select();
      if (state.router) {
        goTo(state.router.history, '/inspect/result/stats', undefined, true);
      }
      if (onEnd) {
        onEnd();
      }
    } catch (e) {
      let error;
      if (e instanceof SyntaxError) {
        error = {
          status: 'error',
          error: 'Bad JSON'
        };
      } else {
        error = {
          status: 'error',
          error: 'Exception'
        };
      }
      yield put(patchEntity(RESULT_KEY, {}, error));
      if (onEnd) {
        onEnd(undefined, e);
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
    yield put(updateEntity(ENVS_KEY, { [projectPath]: environments }));
  });
}

export default [watchInspectProject, watchLoadProjectEnvs];
