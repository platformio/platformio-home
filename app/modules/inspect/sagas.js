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

import { CONFIG_KEY, METRICS_KEY, RESULT_KEY } from '@inspect/constants';
import { INSPECT_PROJECT, REINSPECT_PROJECT, inspectProject } from '@inspect/actions';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { deleteEntity, updateEntity, updateStorageItem } from '@store/actions';
import {
  selectInspectionResult,
  selectIsConfigurationDifferent,
  selectSavedConfiguration
} from '@inspect/selectors';

import { apiFetchData } from '@store/api';
import { goTo } from '@core/helpers';
import jsonrpc from 'jsonrpc-lite';

function* _inspectMemory({ projectDir, env }) {
  const start = Date.now();
  yield call(apiFetchData, {
    query: 'core.call',
    params: [['run', '-d', projectDir, '-e', env, '-t', 'sizedata']]
  });

  const buildDir = yield call(apiFetchData, {
    query: 'project.config_call',
    params: [
      { path: pathlib.join(projectDir, 'platformio.ini') },
      'get_optional_dir',
      'build'
    ]
  });
  const sizedataPath = pathlib.join(buildDir, env, 'sizedata.json');

  const jsonContent = yield call(apiFetchData, {
    query: 'os.request_content',
    params: [sizedataPath]
  });
  if (!jsonContent) {
    throw new Error('sizedata.json file not found. Build error?');
  }
  const result = JSON.parse(jsonContent);
  const duration = Date.now() - start;
  yield put(
    updateStorageItem([METRICS_KEY, projectDir, env, 'memory'].join(':'), duration)
  );
  return result;
}

function* _inspectCode({ projectDir, env }) {
  const start = Date.now();
  let codeCheckResults;
  try {
    codeCheckResults = yield call(apiFetchData, {
      query: 'core.call',
      params: [['check', '-d', projectDir, '-e', env, '--json-output']]
    });
    const duration = Date.now() - start;
    yield put(
      updateStorageItem([METRICS_KEY, projectDir, env, 'code'].join(':'), duration)
    );
    if (codeCheckResults && codeCheckResults.length) {
      return codeCheckResults;
    }
  } catch (e) {
    if (e instanceof jsonrpc.JsonRpcError) {
      // Try to recover from error because of return code <> 0
      codeCheckResults = JSON.parse(e.data);
      if (codeCheckResults && codeCheckResults.length) {
        return codeCheckResults;
      }
    }
    throw e;
  }
  throw new Error('Unexpected code check result');
}

function* watchInspectProject() {
  yield takeLatest(INSPECT_PROJECT, function*({ configuration, onEnd }) {
    if (!(yield select(selectIsConfigurationDifferent, configuration))) {
      const currentResult = yield select(selectInspectionResult);
      if (currentResult) {
        // Result is already present
        if (onEnd) {
          onEnd(currentResult);
        }
        return;
      }
    }
    yield put(deleteEntity(new RegExp(`^${RESULT_KEY}$`)));
    yield put(updateStorageItem(CONFIG_KEY, configuration));

    const state = yield select();
    if (state.router) {
      yield call(goTo, state.router.history, '/inspect/processing', undefined, true);
    }

    const { memory, code } = configuration;
    try {
      let memoryResult;
      let codeCheckResult;

      if (memory) {
        memoryResult = yield call(_inspectMemory, configuration);
        yield put(updateEntity(RESULT_KEY, { memory: memoryResult }));
      }

      if (code) {
        codeCheckResult = yield call(_inspectCode, configuration);
        yield put(
          updateEntity(RESULT_KEY, {
            memory: memoryResult,
            codeChecks: codeCheckResult
          })
        );
      }
      const entity = { memory: memoryResult, codeChecks: codeCheckResult };
      if (onEnd) {
        onEnd(entity);
      }
      if (state.router) {
        yield call(goTo, state.router.history, '/inspect/result', undefined, true);
      }
    } catch (e) {
      console.error('Exception during inspectProject', e);
      let error = 'Exception';
      if (e instanceof jsonrpc.JsonRpcError) {
        error = e.message;
        if (e.data) {
          error += ': ' + JSON.stringify(e.data);
        }
      } else if (e instanceof SyntaxError) {
        error = 'Bad JSON';
      }
      if (onEnd) {
        onEnd(undefined, error);
      }
      yield put(updateEntity(RESULT_KEY, { error }));
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

export default [watchInspectProject, watchReinspectProject];
