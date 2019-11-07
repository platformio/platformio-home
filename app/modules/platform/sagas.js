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

import * as actions from './actions';
import * as selectors from './selectors';

import {
  STORE_READY,
  deleteEntity,
  updateEntity,
  updateStorageItem
} from '../../store/actions';
import {
  all,
  call,
  put,
  select,
  take,
  takeEvery,
  takeLatest
} from 'redux-saga/effects';
import { notifyError, notifySuccess, updateRouteBadge } from '../core/actions';

import { PLATFORMIO_API_ENDPOINT } from '../../config';
import ReactGA from 'react-ga';
import { apiFetchData } from '../../store/api';
import { goTo } from '../core/helpers';
import jsonrpc from 'jsonrpc-lite';
import requests from 'superagent';
import { selectStorageItem } from '../../store/selectors';

// Cache size
const INSTALLED_PLATFORMS_DATA_CACHE = 10;

function* _loadRegistryPlatforms(silent) {
  let items = [];
  try {
    items = yield call(apiFetchData, {
      query: 'core.call',
      params: [['platform', 'search', '--json-output']]
    });
  } catch (err) {
    silent ? console.error(err) : yield put(notifyError('Platforms: Registry', err));
  }
  yield put(updateEntity('registryPlatforms', items));
}

function* _loadRegistryFrameworks(silent) {
  let items = [];
  try {
    items = yield call(apiFetchData, {
      query: 'core.call',
      params: [['platform', 'frameworks', '--json-output']]
    });
  } catch (err) {
    silent ? console.error(err) : yield put(notifyError('Platforms: Frameworks', err));
  }
  yield put(updateEntity('registryFrameworks', items));
}

export function* checkRegistryPlatformsAndFrameworks(silent) {
  const tasks = [];
  if (!(yield select(selectors.selectRegistryPlatforms))) {
    tasks.push(call(_loadRegistryPlatforms, silent));
  }
  if (!(yield select(selectors.selectRegistryFrameworks))) {
    tasks.push(call(_loadRegistryFrameworks, silent));
  }
  yield all(tasks);
}

function* checkBoards() {
  if (yield select(selectors.selectBoards)) {
    return;
  }
  try {
    let items = yield call(apiFetchData, {
      query: 'core.call',
      params: [['boards', '--json-output']]
    });
    items = items.map(item => {
      item.frameworks = item.frameworks || [];
      return item;
    });
    yield put(updateEntity('boards', items));
  } catch (err) {
    yield put(notifyError('Could not load boards list', err));
  }
}

function* checkRegistryPackages() {
  if (yield select(selectors.selectRegistryPackages)) {
    return;
  }
  let items = null;
  try {
    items = yield call(() => {
      const r = requests.get(`${PLATFORMIO_API_ENDPOINT}/packages`);
      return new Promise((resolve, reject) => {
        r.end((err, result) =>
          err || !result.ok ? reject(err) : resolve(result.body)
        );
      });
    });
  } catch (err) {}
  yield put(updateEntity('registryPackages', items));
}

// WATCHERS

function* watchLoadBoards() {
  const silent = true;
  while (true) {
    yield take(actions.LOAD_BOARDS);
    yield call(checkRegistryPlatformsAndFrameworks, silent);
    yield call(checkBoards);
  }
}

function* watchLoadRegistryPlatformsOrFrameworks() {
  yield takeEvery(
    [actions.LOAD_REGISTRY_PLATFORMS, actions.LOAD_REGISTRY_FRAMEWORKS],
    function*() {
      yield call(checkRegistryPlatformsAndFrameworks);
    }
  );
}

function* watchLoadPlatformData() {
  yield takeLatest(actions.LOAD_PLATFORM_DATA, function*({ name }) {
    // need this data to make titled buttons
    const silent = name.includes('@');
    yield call(checkRegistryPlatformsAndFrameworks, silent);

    // if installed platform with specific version
    if (name.includes('@')) {
      if (yield select(selectors.selectInstalledPlatformData, name)) {
        return;
      }
      try {
        const data = yield call(apiFetchData, {
          query: 'core.call',
          params: [['platform', 'show', name, '--json-output']]
        });
        const items = (yield select(selectors.selectInstalledPlatformsData)) || [];
        items.push(data);
        yield put(
          updateEntity(
            'installedPlatformsData',
            items.slice(INSTALLED_PLATFORMS_DATA_CACHE * -1)
          )
        );
      } catch (err) {
        if (
          err instanceof jsonrpc.JsonRpcError &&
          err.data.includes('Error: Unknown development platform')
        ) {
          yield put(deleteEntity(/^installedPlatforms/));
          const state = yield select();
          if (state.router) {
            return goTo(state.router.history, '/platforms/installed', undefined, true);
          }
        } else {
          yield put(notifyError('Could not load platform data', err));
        }
      }
    } else {
      yield [call(checkBoards), call(checkRegistryPackages)];
    }
  });
}

function* watchLoadFrameworkData() {
  yield takeLatest(actions.LOAD_FRAMEWORK_DATA, function*() {
    const silent = false;
    yield [call(checkRegistryPlatformsAndFrameworks, silent), call(checkBoards)];
  });
}

function* watchLoadInstalledPlatforms() {
  while (true) {
    yield take(actions.LOAD_INSTALLED_PLATFORMS);
    const items = yield select(selectors.selectInstalledPlatforms);
    if (items) {
      continue;
    }
    yield call(function*() {
      try {
        const items = yield call(apiFetchData, {
          query: 'core.call',
          params: [['platform', 'list', '--json-output']]
        });
        yield put(updateEntity('installedPlatforms', items));
      } catch (err) {
        yield put(notifyError('Could not load installed platforms', err));
      }
    });
  }
}

function* watchLoadPlatformUpdates() {
  while (true) {
    yield take(actions.LOAD_PLATFORM_UPDATES);

    // clean cache
    yield put(deleteEntity(/^platformUpdates/));
    yield put(updateRouteBadge('/platforms/updates', 0));

    yield call(function*() {
      try {
        const items = yield call(apiFetchData, {
          query: 'core.call',
          params: [['platform', 'update', '--only-check', '--json-output']]
        });
        yield put(updateEntity('platformUpdates', items));
      } catch (err) {
        yield put(notifyError('Could not load platform updates', err));
      }
    });
  }
}

function* watchAutoCheckPlatformUpdates() {
  yield take(STORE_READY); // 1-time watcher
  const coreSettings = yield select(selectStorageItem, 'coreSettings');
  const checkInterval = parseInt(
    coreSettings && coreSettings.check_platforms_interval
      ? coreSettings.check_platforms_interval.value
      : 0
  );
  if (checkInterval <= 0) {
    return;
  }
  const lastCheckKey = 'lastCheckPlatformUpdates';
  const now = new Date().getTime();
  const last = (yield select(selectStorageItem, lastCheckKey)) || 0;
  if (now < last + checkInterval * 86400 * 1000) {
    return;
  }
  yield put(updateStorageItem(lastCheckKey, now));
  try {
    const result = yield call(apiFetchData, {
      query: 'core.call',
      params: [['platform', 'update', '--only-check', '--json-output']]
    });
    yield put(updateRouteBadge('/platforms/updates', result.length));
  } catch (err) {
    console.error('Failed check of PIO Core platform updates', err);
  }
}

function* watchInstallPlatform() {
  yield takeEvery(actions.INSTALL_PLATFORM, function*({ platform, onEnd }) {
    let err,
      result = null;
    try {
      const start = new Date().getTime();

      result = yield call(apiFetchData, {
        query: 'core.call',
        params: [['platform', 'install', platform]]
      });

      ReactGA.timing({
        category: 'Platform',
        variable: 'install',
        value: new Date().getTime() - start,
        label: platform
      });

      // clean cache
      yield put(deleteEntity(/^installedPlatforms/));
      yield put(notifySuccess('Platform has been successfully installed', result));
    } catch (_err) {
      err = _err;
      yield put(notifyError('Could not install platform', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err, result);
      }
    }
  });
}

function* watchUninstallOrUpdatePlatform() {
  yield takeEvery([actions.UNINSTALL_PLATFORM, actions.UPDATE_PLATFORM], function*(
    action
  ) {
    const { pkgDir, onEnd } = action;
    let err = null;
    try {
      const result = yield call(apiFetchData, {
        query: 'core.call',
        params: [
          [
            'platform',
            action.type === actions.UNINSTALL_PLATFORM ? 'uninstall' : 'update',
            pkgDir
          ]
        ]
      });

      // remove from state
      if (action.type === actions.UPDATE_PLATFORM) {
        yield put(deleteEntity(/^installedPlatforms/));
      }
      const state = yield select();
      for (const key of Object.keys(state.entities)) {
        if (
          !['installedPlatformsData', 'installedPlatforms', 'platformUpdates'].includes(
            key
          )
        ) {
          continue;
        }
        if (state.entities[key].find(item => item.__pkg_dir === pkgDir)) {
          yield put(
            updateEntity(
              key,
              state.entities[key].filter(item => item.__pkg_dir !== pkgDir)
            )
          );
        }
      }
      yield put(
        notifySuccess(
          `Platform has been successfully ${
            action.type === actions.UNINSTALL_PLATFORM ? 'uninstalled' : 'updated'
          }`,
          result
        )
      );
    } catch (err_) {
      err = err_;
      if (
        err instanceof jsonrpc.JsonRpcError &&
        err.data.includes('Error: Unknown development platform')
      ) {
        yield put(deleteEntity(/^installedPlatforms/));
        const state = yield select();
        if (state.router) {
          return goTo(state.router.history, '/platforms/installed', undefined, true);
        }
      } else {
        yield put(notifyError('Could not load platform data', err));
      }
      yield put(
        notifyError(
          `Could not ${
            action.type === actions.UNINSTALL_PLATFORM ? 'uninstall' : 'update'
          } platform`,
          err
        )
      );
    } finally {
      if (onEnd) {
        yield call(onEnd, err);
      }
    }
  });
}

export default [
  watchLoadBoards,
  watchLoadRegistryPlatformsOrFrameworks,
  watchLoadPlatformData,
  watchLoadFrameworkData,
  watchLoadInstalledPlatforms,
  watchLoadPlatformUpdates,
  watchAutoCheckPlatformUpdates,
  watchInstallPlatform,
  watchUninstallOrUpdatePlatform
];
