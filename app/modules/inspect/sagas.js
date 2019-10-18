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

import { call, put, takeLatest } from 'redux-saga/effects';

import { ENVS_KEY } from '@inspect/constants';
import { LOAD_PROJECT_ENVS } from '@inspect/actions';
import { apiFetchData } from '@store/api';
import { updateEntity } from '@store/actions';

function* watchLoadProjectEnvs() {
  yield takeLatest(LOAD_PROJECT_ENVS, function*({ projectPath }) {
    const environments = yield call(apiFetchData, {
      query: 'project.config_call',
      params: [pathlib.join(projectPath, 'platformio.ini'), 'envs']
    });
    yield put(updateEntity(ENVS_KEY, { [projectPath]: environments }));
  });
}

export default [watchLoadProjectEnvs];
