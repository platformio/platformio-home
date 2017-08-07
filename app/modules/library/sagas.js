/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import * as actions from './actions';
import * as selectors from './selectors';

import { STORE_READY, deleteEntity, updateEntity, updateStorageItem } from '../../store/actions';
import { asyncDelay, lastLine } from '../core/helpers';
import { call, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { notifyError, notifySuccess, updateRouteBadge } from '../core/actions';

import { CHECK_CORE_UPDATES_INTERVAL } from '../../config';
import { apiFetchData } from '../../store/api';
import { checkRegistryPlatformsAndFrameworks } from '../platform/sagas';
import { selectStorageItem } from '../../store/selectors';


// Cache size
const SEARCH_RESULTS_CACHE_SIZE = 10;
const REGISTRY_LIBS_CACHE_SIZE = 10;

function* watchLoadStats() {

  function* resetCacheDelayed(expire) {
    yield asyncDelay(expire);
    yield put(updateEntity('libStats', null));
  }

  yield takeLatest(actions.LOAD_STATS, function*() {
    let data = yield select(selectors.selectStats);
    if (data) {
      return;
    }

    try {
      data = yield call(apiFetchData, {
        query: 'core.call',
        params: [['lib', 'stats', '--json-output']]
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
  yield takeLatest(actions.LOAD_SEARCH_RESULT, function*({query, page}) {
    let result = yield select(selectors.selectSearchResult, query, page);
    if (result) {
      return;
    }
    try {
      let args = ['lib', 'search'];
      if (query) {
        args.push(query);
      }
      args = args.concat(['--page', page, '--json-output']);
      result = yield call(apiFetchData, {
        query: 'core.call',
        params: [args]
      });
    } catch (err) {
      return yield put(notifyError('Libraries: Search', err));
    }
    const results = (yield select(selectors.selectSearchResults)) || [];
    results.push({
      key: selectors.selectStoreSearchKey(query, page),
      result
    });
    yield put(updateEntity('libSearch', results.slice(SEARCH_RESULTS_CACHE_SIZE * -1)));
  });
}

function* watchLoadLibraryData() {
  yield takeLatest(actions.LOAD_LIBRARY_DATA, function*({idOrManifest}) {
    switch (typeof idOrManifest) {
      case 'number': {
        if (yield select(selectors.selectRegistryLib, parseInt(idOrManifest))) {
          return;
        }
        try {
          const data = yield call(apiFetchData, {
            query: 'core.call',
            params: [['lib', 'show', idOrManifest, '--json-output']]
          });
          const items = (yield select(selectors.selectRegistryLibs)) || [];
          items.push(data);
          yield put(updateEntity('registryLibs', items.slice(REGISTRY_LIBS_CACHE_SIZE * -1)));
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
      items = yield call(apiFetchData, {
        query: 'core.call',
        params: [['lib', 'builtin', '--json-output']]
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
    const storages = yield select(selectors.selectInstalledLibs);
    for (const storage of storages) {
      if (storage.items) {
        continue;
      }
      yield fork(function*() {
        try {
          let args = ['lib'];
          if (storage.path) {
            args = args.concat(['--storage-dir', storage.path]);
          } else {
            args.push('--global');
          }
          args = args.concat(['list', '--json-output']);
          const items = yield call(apiFetchData, {
            query: 'core.call',
            params: [args]
          });
          yield put(updateEntity(`installedLibs${storage.initialPath}`, items));
        } catch (err) {
          return yield put(notifyError('Libraries: Installed', err));
        }
      });
    }
  }
}

function* watchLoadLibUpdates() {
  while (true) {
    yield take(actions.LOAD_LIB_UPDATES);

     // clean cache
    yield put(deleteEntity(/^libUpdates/));
    yield put(updateRouteBadge('/libraries/updates', 0));

    const storages = yield select(selectors.selectLibUpdates);
    for (const storage of storages) {
      yield fork(function*() {
        try {
          let args = ['lib'];
          if (storage.path) {
            args = args.concat(['--storage-dir', storage.path]);
          } else {
            args.push('--global');
          }
          args = args.concat(['update', '--only-check', '--json-output']);
          const items = yield call(apiFetchData, {
            query: 'core.call',
            params: [args]
          });
          yield put(updateEntity(`libUpdates${storage.initialPath}`, items));
        } catch (err) {
          return yield put(notifyError('Libraries: Updates', err));
        }
      });
    }
  }
}

function* watchAutoCheckLibraryUpdates() {
  const lastCheckKey = 'lastCheckLibraryUpdates';
  yield takeLatest(STORE_READY, function*() {
    const now = new Date().getTime();
    const last = (yield select(selectStorageItem, lastCheckKey)) || 0;
    if (now < last + (CHECK_CORE_UPDATES_INTERVAL * 1000)) {
      return;
    }
    yield put(updateStorageItem(lastCheckKey, now));
    try {
      // TODO: Check updates for projects and extra storages
      const result = yield call(apiFetchData, {
        query: 'core.call',
        params: [['lib', '--global', 'update', '--only-check', '--json-output']]
      });
      yield put(updateRouteBadge('/libraries/updates', result.length));
    } catch (err) {
      console.error('Failed check of PIO Core library updates', err);
    }
  });
}

function* watchInstallLibrary() {
  yield takeEvery(actions.INSTALL_LIBRARY, function*({storageDir, lib, onEnd}) {
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
      result = yield call(apiFetchData, {
        query: 'core.call',
        params: [args]
      });
      yield put(notifySuccess('Congrats!', lastLine(result)));
    } catch (err_) {
      err = err_;
      yield put(notifyError('Libraries: Could not install library', err));
    }
    finally {
      if (onEnd) {
        yield call(onEnd, err, result);
      }
    }
  });
}

function* watchUninstallOrUpdateLibrary() {
  yield takeEvery([actions.UNINSTALL_LIBRARY, actions.UPDATE_LIBRARY], function*(action) {
    const {storageDir, pkgDir, onEnd} = action;
    try {
      const result = yield call(apiFetchData,
        {
          query: 'core.call',
          params: [['lib', '--storage-dir', storageDir, action.type === actions.UNINSTALL_LIBRARY ? 'uninstall' : 'update', pkgDir]]
        }
      );

      // remove from state
      if (action.type === actions.UPDATE_LIBRARY) {
        yield put(deleteEntity(/^installedLibs/));
      }
      const state = yield select();
      for (const key of Object.keys(state.entities)) {
        if (!key.startsWith('installedLibs') && !key.startsWith('libUpdates')) {
          continue;
        }
        if (state.entities[key].find(item => item.__pkg_dir === pkgDir)) {
          yield put(updateEntity(key, state.entities[key].filter(item => item.__pkg_dir !== pkgDir)));
        }
      }

      yield put(notifySuccess('Congrats!', lastLine(result)));

    } catch (err) {
      yield put(notifyError(`Libraries: Could not ${action.type === actions.UNINSTALL_LIBRARY? 'uninstall' : 'update'} library`, err));
    }
    finally {
      if (onEnd) {
        yield call(onEnd);
      }
    }
  });
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
  watchUninstallOrUpdateLibrary
];
