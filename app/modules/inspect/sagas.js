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

import * as pathlib from '@core/path';

import { CONFIG_KEY, ENVS_KEY, RESULT_KEY } from '@inspect/constants';
import {
  INSPECT_PROJECT,
  LOAD_PROJECT_ENVS,
  REINSPECT_PROJECT,
  inspectProject
} from '@inspect/actions';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import { deleteEntity, updateEntity } from '@store/actions';
import {
  selectInspectionResult,
  selectIsConfigurationDifferent,
  selectSavedConfiguration
} from '@inspect/selectors';

import { apiFetchData } from '@store/api';
import { goTo } from '@core/helpers';
import jsonrpc from 'jsonrpc-lite';

const RUN_PARALLEL_INSPECT = false;

function* watchLoadProjectEnvs() {
  yield takeLatest(LOAD_PROJECT_ENVS, function*({ projectPath }) {
    const environments = yield call(apiFetchData, {
      query: 'project.config_call',
      params: [pathlib.join(projectPath, 'platformio.ini'), 'envs']
    });
    yield put(updateEntity(ENVS_KEY, { [projectPath]: environments }));
  });
}

function* _inspectMemory({ projectDir, env }) {
  yield call(apiFetchData, {
    query: 'core.call',
    params: [['run', '-d', projectDir, '-e', env, '-t', 'sizedata']]
  });

  // FIXME: fails! invalid dir!
  // const buildDir = yield call(apiFetchData, {
  //   query: 'project.config_call',
  //   params: [pathlib.join(projectDir, 'platformio.ini'), 'get_optional_dir', 'build']
  // });
  // const uri = pathlib.join(buildDir, env, 'sizedata.json');

  // FIXME: build dir can be optional
  const uri = pathlib.join(projectDir, '.pio', 'build', env, 'sizedata.json');

  const jsonContent = yield call(apiFetchData, {
    query: 'os.request_content',
    params: [uri]
  });
  if (!jsonContent) {
    throw new Error('sizedata.json file not found. Build error?');
  }
  const memoryData = JSON.parse(jsonContent);
  return memoryData.memory;
}

function* _inspectCode({ projectDir, env }) {
  const codeCheckResults = yield call(apiFetchData, {
    query: 'core.call',
    params: [['check', '-d', projectDir, '-e', env, '--json-output']]
  });

  if (codeCheckResults && codeCheckResults.length) {
    return codeCheckResults[0];
  }
  throw new Error('Unexpected code check result');
}

function* watchInspectProject() {
  yield takeLatest(INSPECT_PROJECT, function*({ configuration, onEnd }) {
    if (!(yield select(selectIsConfigurationDifferent, configuration))) {
      const state = yield select();
      const currentResult = selectInspectionResult(state);
      if (currentResult) {
        // Result is already present
        if (state.router) {
          goTo(state.router.history, '/inspect/result/stats', undefined, true);
        }
        if (onEnd) {
          onEnd(currentResult);
        }
        return;
      }
    }
    yield put(deleteEntity(new RegExp(`^${RESULT_KEY}$`)));
    const { memory, code } = configuration;
    try {
      let memoryResult;
      let codeCheckResult;

      if (RUN_PARALLEL_INSPECT) {
        const parallelTasks = [];
        if (memory) {
          parallelTasks.push(call(_inspectMemory, configuration));
        }
        if (code) {
          parallelTasks.push(call(_inspectCode, configuration));
        }
        // FIXME: most time gives JsonRPC error 4003, but works on occasion. Backend issue?
        const results = yield all(parallelTasks);
        if (memory) {
          memoryResult = results.shift();
        }
        if (code) {
          codeCheckResult = results.shift();
        }
      } else {
        if (memory) {
          memoryResult = yield call(_inspectMemory, configuration);
        }
        if (code) {
          codeCheckResult = yield call(_inspectCode, configuration);
        }
      }
      const entity = { memory: memoryResult, codeCheck: codeCheckResult };
      yield put(updateEntity(CONFIG_KEY, configuration));
      yield put(updateEntity(RESULT_KEY, entity));

      const state = yield select();
      if (state.router) {
        goTo(state.router.history, '/inspect/result/stats', undefined, true);
      }
      if (onEnd) {
        onEnd(entity);
      }
    } catch (e) {
      console.error('Exception during inspectProject', e);
      if (!onEnd) {
        return;
      }
      let error = 'Exception';
      if (e instanceof jsonrpc.JsonRpcError) {
        error = e.message;
        if (e.data) {
          error += ': ' + JSON.stringify(e.data);
        }
      } else if (e instanceof SyntaxError) {
        error = 'Bad JSON';
      }
      onEnd(undefined, error);
    }
  });
}

function* watchReinspectProject() {
  yield takeLatest(REINSPECT_PROJECT, function*({ onEnd }) {
    const configuration = yield select(selectSavedConfiguration);
    if (!configuration) {
      throw new Error('No inspection configuration ro run reinspectProject');
    }
    yield put(deleteEntity(new RegExp(`^${RESULT_KEY}$`)));
    yield put(inspectProject(configuration, onEnd));
  });
}

export default [watchLoadProjectEnvs, watchInspectProject, watchReinspectProject];
