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
  updateStorageItem,
} from '../../store/actions';
import { asyncDelay, goTo } from '../core/helpers';
import {
  call,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';
import { notifyError, notifySuccess, updateRouteBadge } from '../core/actions';

import { backendFetchData } from '../../store/backend';
import { checkRegistryPlatformsAndFrameworks } from '../platform/sagas';
import jsonrpc from 'jsonrpc-lite';
import { preloadProjects } from '../project/sagas';
import { selectStorageItem } from '../../store/selectors';

// Cache size
const SEARCH_RESULTS_CACHE_SIZE = 10;
const REGISTRY_LIBS_CACHE_SIZE = 10;

function cleanupPackageManagerOutput(output) {
  return output.replace(/^Library Manager:/gm, '');
}

function* watchLoadStats() {
  function* resetCacheDelayed(expire) {
    yield asyncDelay(expire);
    yield put(updateEntity('libStats', null));
  }

  yield takeLatest(actions.LOAD_STATS, function* () {
    let data = yield select(selectors.selectStats);
    if (data) {
      return;
    }

    try {
      data = yield call(backendFetchData, {
        query: 'core.call',
        params: [['lib', 'stats', '--json-output']],
      });
      yield put(updateEntity('libStats', data));
    } catch (err) {
      return yield put(notifyError('Libraries: Stats', err));
    }

    // reset state after 1 hour
    yield fork(resetCacheDelayed, 3600 * 1000);
  });
}

function* watchLoadSearchResult() {
  yield takeLatest(actions.LOAD_SEARCH_RESULT, function* ({ query, page, onEnd }) {
    let result = yield select(selectors.selectSearchResult, query, page);
    if (result) {
      if (onEnd) {
        onEnd();
      }
      return;
    }
    try {
      let args = ['lib', 'search'];
      if (query) {
        args.push(query);
      }
      args = args.concat(['--page', page, '--json-output']);
      result = yield call(backendFetchData, {
        query: 'core.call',
        params: [args],
      });
    } catch (err) {
      if (onEnd) {
        onEnd(err);
      }
      return yield put(notifyError('Libraries: Search', err));
    }
    const results = (yield select(selectors.selectSearchResults)) || [];
    results.push({
      key: selectors.selectStoreSearchKey(query, page),
      result,
    });
    yield put(updateEntity('libSearch', results.slice(SEARCH_RESULTS_CACHE_SIZE * -1)));
    if (onEnd) {
      onEnd();
    }
  });
}

function* watchLoadLibraryData() {
  yield takeLatest(actions.LOAD_LIBRARY_DATA, function* ({ idOrManifest }) {
    switch (typeof idOrManifest) {
      case 'number': {
        if (yield select(selectors.selectRegistryLib, parseInt(idOrManifest))) {
          return;
        }
        try {
          const data = yield call(backendFetchData, {
            query: 'core.call',
            params: [['lib', 'show', idOrManifest, '--json-output']],
          });
          const items = (yield select(selectors.selectRegistryLibs)) || [];
          items.push(data);
          yield put(
            updateEntity('registryLibs', items.slice(REGISTRY_LIBS_CACHE_SIZE * -1))
          );
        } catch (err) {
          return yield put(notifyError('Libraries: Data', err));
        }
        break;
      }
      case 'object': {
        const silent = true;
        yield call(checkRegistryPlatformsAndFrameworks, silent);
        break;
      }
    }
  });
}

function* watchLoadBuiltinLibs() {
  while (true) {
    yield take(actions.LOAD_BUILTIN_LIBS);
    let items = yield select(selectors.selectBuiltinLibs);
    if (items) {
      continue;
    }
    try {
      items = yield call(backendFetchData, {
        query: 'core.call',
        params: [['lib', 'builtin', '--json-output'], { force_subprocess: true }],
      });
      yield put(updateEntity('builtinLibs', items));
    } catch (err) {
      return yield put(notifyError('Libraries: Builtin', err));
    }
  }
}

function* watchLoadInstalledLibs() {
  while (true) {
    yield take(actions.LOAD_INSTALLED_LIBS);
    yield call(preloadProjects);
    const storages = yield select(selectors.selectInstalledLibs);
    for (const storage of storages) {
      if (storage.items) {
        continue;
      }
      yield fork(function* () {
        try {
          let args = ['lib'];
          if (storage.path) {
            args = args.concat(['--storage-dir', storage.path]);
          } else {
            args.push('--global');
          }
          args = args.concat(['list', '--json-output']);
          const items = yield call(backendFetchData, {
            query: 'core.call',
            params: [args, { force_subprocess: true }],
          });
          yield put(updateEntity(`installedLibs${storage.initialPath}`, items));
        } catch (err) {
          if (
            err instanceof jsonrpc.JsonRpcError &&
            err.data.includes('does not exist')
          ) {
            return yield put(updateEntity(`installedLibs${storage.initialPath}`, []));
          }
          return yield put(notifyError('Libraries: Installed', err));
        }
      });
    }
  }
}

function* fetchStorageUpdates(storage) {
  let args = ['lib'];
  if (storage.options && storage.options.projectDir && storage.options.projectEnv) {
    args = args.concat([
      '--storage-dir',
      storage.options.projectDir,
      '--environment',
      storage.options.projectEnv,
    ]);
  } else if (storage.path) {
    args = args.concat(['--storage-dir', storage.path]);
  } else {
    args.push('--global');
  }
  args = args.concat(['update', '--only-check', '--json-output']);
  return yield call(backendFetchData, {
    query: 'core.call',
    params: [args, { force_subprocess: true }],
  });
}

function* watchLoadLibUpdates() {
  while (true) {
    yield take(actions.LOAD_LIB_UPDATES);

    // clean cache
    yield put(deleteEntity(/^libUpdates/));
    yield put(updateRouteBadge('/libraries/updates', 0));

    const storages = yield select(selectors.selectLibraryStorages);
    for (const storage of storages) {
      yield fork(function* () {
        try {
          yield put(
            updateEntity(
              `libUpdates${storage.initialPath}`,
              yield call(fetchStorageUpdates, storage)
            )
          );
        } catch (err) {
          return yield put(notifyError('Libraries: Updates', err));
        }
      });
    }
  }
}

function* watchAutoCheckLibraryUpdates() {
  yield take(STORE_READY); // 1-time watcher
  const coreSettings = yield select(selectStorageItem, 'coreSettings');
  const checkInterval = parseInt(
    coreSettings && coreSettings.check_libraries_interval
      ? coreSettings.check_libraries_interval.value
      : 0
  );
  if (checkInterval <= 0) {
    return;
  }
  const lastCheckKey = 'lastCheckLibraryUpdates';
  const now = new Date().getTime();
  const last = (yield select(selectStorageItem, lastCheckKey)) || 0;
  if (now < last + checkInterval * 86400 * 1000) {
    return;
  }
  yield put(updateStorageItem(lastCheckKey, now));

  yield call(preloadProjects);

  let total = 0;
  const storages = yield select(selectors.selectLibraryStorages);
  for (const storage of storages) {
    try {
      total += (yield call(fetchStorageUpdates, storage)).length;
    } catch (err) {
      console.error(
        'Failed check of PIO Core library updates for ' + storage.path,
        err
      );
    }
  }
  yield put(updateRouteBadge('/libraries/updates', total));
}

function* watchInstallLibrary() {
  yield takeEvery(actions.INSTALL_LIBRARY, function* ({ storageDir, lib, onEnd }) {
    // clean cache
    yield put(deleteEntity(/^installedLibs/));
    let err,
      result = null;
    try {
      let args = ['lib'];
      if (storageDir) {
        args = args.concat(['--storage-dir', storageDir]);
      } else {
        args.push('--global');
      }
      args = args.concat(['install', lib]);
      result = yield call(backendFetchData, {
        query: 'core.call',
        params: [args, { force_subprocess: true }],
      });
      yield put(notifySuccess('Congrats!', cleanupPackageManagerOutput(result)));
    } catch (err_) {
      err = err_;
      yield put(notifyError('Libraries: Could not install library', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err, result);
      }
    }
  });
}

function* watchUninstallOrUpdateLibrary() {
  yield takeEvery(
    [actions.UNINSTALL_LIBRARY, actions.UPDATE_LIBRARY],
    function* (action) {
      const { storage, pkg, onEnd } = action;
      let err;
      try {
        const result = yield call(backendFetchData, {
          query: 'core.call',
          params: [
            action.type === actions.UNINSTALL_LIBRARY &&
            storage.options &&
            storage.options.projectDir &&
            storage.options.projectEnv
              ? [
                  'lib',
                  '--storage-dir',
                  storage.options.projectDir,
                  '--environment',
                  storage.options.projectEnv,
                  action.type === actions.UNINSTALL_LIBRARY ? 'uninstall' : 'update',
                  `${pkg.ownername ? `${pkg.ownername}/` : ''}${pkg.name}@${
                    pkg.version
                  }`,
                ]
              : [
                  'lib',
                  '--storage-dir',
                  storage.path,
                  action.type === actions.UNINSTALL_LIBRARY ? 'uninstall' : 'update',
                  pkg.__pkg_dir,
                ],
            { force_subprocess: true },
          ],
        });

        // remove from state
        if (action.type === actions.UPDATE_LIBRARY) {
          yield put(deleteEntity(/^installedLibs/));
        }
        const state = yield select();
        for (const key of Object.keys(state.entities)) {
          if (!key.startsWith('installedLibs') && !key.startsWith('libUpdates')) {
            continue;
          }
          if (state.entities[key].find((item) => item.__pkg_dir === pkg.__pkg_dir)) {
            yield put(
              updateEntity(
                key,
                state.entities[key].filter((item) => item.__pkg_dir !== pkg.__pkg_dir)
              )
            );
          }
        }

        yield put(notifySuccess('Congrats!', cleanupPackageManagerOutput(result)));
      } catch (err_) {
        err = err_;
        if (
          err instanceof jsonrpc.JsonRpcError &&
          err.data.includes('Error: Could not find the package')
        ) {
          yield put(deleteEntity(/^installedLibs/));
          if (action.type === actions.UNINSTALL_LIBRARY) {
            yield put(actions.loadInstalledLibs());
          }
          const state = yield select();
          if (state.router) {
            return goTo(state.router.history, '/libraries/installed', undefined, true);
          }
        } else {
          yield put(
            notifyError(
              `Libraries: Could not ${
                action.type === actions.UNINSTALL_LIBRARY ? 'uninstall' : 'update'
              } library`,
              err
            )
          );
        }
      } finally {
        if (onEnd) {
          yield call(onEnd, err);
        }
      }
    }
  );
}

export default [
  watchLoadStats,
  watchLoadSearchResult,
  watchLoadLibraryData,
  watchLoadBuiltinLibs,
  watchLoadInstalledLibs,
  watchLoadLibUpdates,
  watchAutoCheckLibraryUpdates,
  watchInstallLibrary,
  watchUninstallOrUpdateLibrary,
];
