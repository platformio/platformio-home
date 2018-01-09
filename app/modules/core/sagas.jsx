/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition, no-case-declarations */

import * as actions from './actions';
import * as selectors from './selectors';

import { Button, Modal, notification } from 'antd';
import { CHECK_CORE_UPDATES_INTERVAL, PIOPLUS_API_ENDPOINT } from '../../config';
import { STORE_READY, deleteEntity, updateEntity, updateStorageItem } from '../../store/actions';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { inIframe, reportException } from './helpers';

import React from 'react';
import URL from 'url-parse';
import { apiFetchData } from '../../store/api';
import { getStore } from '../../store/index';
import qs from 'querystringify';
import requests from 'superagent';
import { selectStorageItem } from '../../store/selectors';


const REQUESTED_CONTENTS_CACHE_SIZE = 50;
const OS_FS_GLOBS_CACHE_SIZE = 50;

function* watchShowAtStartup() {
  yield takeEvery(actions.SHOW_AT_STARTUP, function*({value}) {
    const caller = yield select(selectStorageItem, 'coreCaller');
    if (!caller) {
      return;
    }
    const data = (yield select(selectStorageItem, 'showOnStartup')) || {};
    data[caller] = value;
    yield put(updateStorageItem('showOnStartup', data));
  });
}

function* watchNotifyError() {

  function reportIssue(title, body) {
    title = `Home: ${title}`;
    return getStore().dispatch(actions.osOpenUrl(`https://github.com/platformio/platformio-core/issues/new?${ qs.stringify({title, body}) }`));
  }

  yield takeEvery(actions.NOTIFY_ERROR, function({title, err}) {
    if (!err) {
      return;
    }
    console.error(title, err);
    let description = err.stack || err.toString();
    if (err.name === 'JsonRpcError') {
      description = err.message;
      if (err.data) {
        description += ': ' + err.data;
      }
    }
    notification.error({
      message: title,
      description,
      duration: 0,
      btn: (
      <Button type='danger' onClick={ () => reportIssue(title, description) }>
        Report a problem
      </Button>)
    });
    reportException(`${title} => ${description}`);
  });
}

function* watchNotifySuccess() {
  yield takeEvery(actions.NOTIFY_SUCCESS, function({title, result}) {
    if (!result) {
      return;
    }
    console.info(title, result);
    if (result.length > 255) {
      Modal.success({
        title,
        content: (
        <div>
          { result.split('\n').map((text, index) => (
              <div key={ index }>
                { text }
              </div>)) }
        </div>)
      });
    } else {
      notification.success({
        message: title,
        description: result
      });
    }
  });
}

function* watchUpdateRouteBadge() {
  const itemKey = 'routeBadges';
  yield takeEvery(actions.UPDATE_ROUTE_BADGE, function*({path, count}) {
    const result = (yield select(selectStorageItem, itemKey)) || {};
    result[path] = parseInt(count);
    if (result[path] === 0) {
      delete result[path];
    }
    yield put(updateStorageItem(itemKey, result));
  });
}

function* watchOSRequests() {
  yield takeEvery([actions.OS_OPEN_URL, actions.OS_REVEAL_FILE, actions.OS_RENAME_FILE, actions.OS_MAKE_DIRS, actions.OS_COPY_FILE], function*(action) {
    try {
      switch (action.type) {
        case actions.OS_OPEN_URL:
          const url = new URL(action.url, true);
          url.query.utm_source = 'platformio';
          url.query.utm_medium = 'piohome';

          if (action.url.startsWith('http') && !inIframe()) {
            const redirectWindow = window.open(url.toString(), '_blank');
            redirectWindow.location;
          } else {
            yield call(apiFetchData, {
              query: 'os.open_url',
              params: [url.toString()]
            });
          }
          break;

        case actions.OS_REVEAL_FILE:
          yield call(apiFetchData, {
            query: 'os.reveal_file',
            params: [action.path]
          });
          break;

        case actions.OS_RENAME_FILE:
          yield call(apiFetchData, {
            query: 'os.rename',
            params: [action.src, action.dst]
          });
          break;

        case actions.OS_COPY_FILE:
          yield call(apiFetchData, {
            query: 'os.copy',
            params: [action.src, action.dst]
          });
          break;

        case actions.OS_MAKE_DIRS:
          yield call(apiFetchData, {
            query: 'os.make_dirs',
            params: [action.path]
          });
          break;
      }
    } catch (err) {
      return yield put(actions.notifyError(action.type, err));
    }
  });
}

function* watchRequestContent() {
  const crossDomains = ['api.github.com', 'raw.githubusercontent.com', 'platformio.org'];
  yield takeEvery(actions.REQUEST_CONTENT, function*({uri, data}) {
    let content = yield select(selectors.selectRequestedContent, uri, data);
    if (content) {
      return;
    }
    try {
      if (uri.startsWith('http') && crossDomains.some(d => uri.includes(d))) {
        content = yield call(() => {
          const r = data ? requests.post(uri).send(data) : requests.get(uri);
          return new Promise((resolve, reject) => {
            r.end((err, result) => err || !result.ok ? reject(err) : resolve(result.text));
          });
        });
      } else {
        content = yield call(apiFetchData, {
          query: 'os.request_content',
          params: [uri, data]
        });
      }
      const contents = (yield select(selectors.selectRequestedContents)) || [];
      contents.push({
        key: selectors.getRequestContentKey(uri, data),
        content
      });
      yield put(updateEntity('requestedContents', contents.slice(REQUESTED_CONTENTS_CACHE_SIZE * -1)));
    } catch (err) {
      return yield put(actions.notifyError('Error occurred while requesting content from ' + uri, err));
    }
  });
}

function* watchOsFSGlob() {
  yield takeEvery(actions.OS_FS_GLOB, function*({pathnames, rootDir}) {
    let items = yield select(selectors.selectOsFSGlob, pathnames, rootDir);
    if (items) {
      return;
    }
    try {
      items = yield call(apiFetchData, {
        query: 'os.glob',
        params: [pathnames, rootDir]
      });
      const current = (yield select(selectors.selectOsFSGlobs)) || [];
      current.push({
        key: selectors.selectOsFSGlobKey(pathnames, rootDir),
        items
      });
      yield put(updateEntity('osFsGlob', current.slice(OS_FS_GLOBS_CACHE_SIZE * -1)));
    } catch (err) {
      return yield put(actions.notifyError('Error occurred while glob ' + JSON.stringify(pathnames), err));
    }
  });
}

function* watchLoadLogicalDevices() {
  yield takeLatest(actions.LOAD_LOGICAL_DEVICES, function*({ force }) {
    if (force) {
      yield put(deleteEntity(/^logicalDevices/));
    }
    let items = yield select(selectors.selectLogicalDevices);
    if (items) {
      return;
    }
    try {
      items = yield call(apiFetchData, {
        query: 'os.get_logical_devices'
      });
      yield put(updateEntity('logicalDevices', items));
    } catch (err) {
      return yield put(actions.notifyError('Could not load logical devices', err));
    }
  });
}

function* watchOsListDir() {
  yield takeEvery(actions.OS_LIST_DIR, function*({ path }) {
    let items = yield select(selectors.selectOsDirItems);
    if (items && items.hasOwnProperty(path)) {
      return;
    } else if (!items) {
      items = {};
    }
    try {
      const result = yield call(apiFetchData, {
        query: 'os.list_dir',
        params: [ /^[A-Z]:$/.test(path) ? path + '\\' : path]
      });
      yield put(updateEntity('osDirItems', Object.assign({}, items, {[path]: result})));
    } catch (err) {
      return yield put(actions.notifyError('Could not list directory' + path, err));
    }
  });
}

function* watchOsIsFile() {
  yield takeEvery(actions.OS_IS_FILE, function*({ path }) {
    let items = yield select(selectors.selectOsIsFileItems);
    if (items && items.hasOwnProperty(path)) {
      return;
    } else if (!items) {
      items = {};
    }
    try {
      const result = yield call(apiFetchData, {
        query: 'os.is_file',
        params: [path]
      });
      yield put(updateEntity('osIsFileItems', Object.assign({}, items, {[path]: result})));
    } catch (err) {
      return yield put(actions.notifyError('Could not check is file ' + path, err));
    }
  });
}

function* watchOsIsDir() {
  yield takeEvery(actions.OS_IS_DIR, function*({ path }) {
    let items = yield select(selectors.selectOsIsDirItems);
    if (items && items.hasOwnProperty(path)) {
      return;
    } else if (!items) {
      items = {};
    }
    try {
      const result = yield call(apiFetchData, {
        query: 'os.is_dir',
        params: [path]
      });
      yield put(updateEntity('osIsDirItems', Object.assign({}, items, {[path]: result})));
    } catch (err) {
      return yield put(actions.notifyError('Could not check is directory ' + path, err));
    }
  });
}

function* watchResetFSItems() {
  yield takeLatest(actions.RESET_FS_ITEMS, function*() {
    yield put(updateEntity('osDirItems', null));
    yield put(updateEntity('osIsFileItems', null));
    yield put(updateEntity('osIsDirItems', null));
  });
}

function* watchToggleFavoriteFolder() {
  yield takeEvery(actions.TOGGLE_FAVORITE_FOLDER, function*({ path }) {
    const items = (yield select(selectStorageItem, 'favoriteFolders')) || [];
    yield put(updateStorageItem(
      'favoriteFolders',
      items.includes(path) ? items.filter(item => item !== path) : [...items, path])
    );
  });
}

function* watchSendFeedback() {
  yield takeLatest(actions.SEND_FEEDBACK, function*({body, onEnd}) {
    let err;
    try {
      body = body.trim().substr(0, 1000);
      yield call(apiFetchData, {
        query: 'os.request_content',
        params: [`${PIOPLUS_API_ENDPOINT}/v1/feedback`, {
          body
        }]
      });
      yield put(actions.notifySuccess('Congrats!', 'Your feedback has been submitted.'));
    } catch (err_) {
      err = err_;
      yield put(actions.notifyError('Could not send your feedback, please try later.', err));
    }
    finally {
      if (onEnd) {
        yield call(onEnd, err);
      }
    }
  });
}

function* watchAutoUpdateCorePackages() {
  const lastCheckKey = 'lastUpdateCorePackages';
  yield takeLatest(STORE_READY, function*() {
    const now = new Date().getTime();
    const last = (yield select(selectStorageItem, lastCheckKey)) || 0;
    if (now < last + (CHECK_CORE_UPDATES_INTERVAL * 1000)) {
      return;
    }
    yield put(updateStorageItem(lastCheckKey, now));
    try {
      const result = yield call(apiFetchData, {
        query: 'core.call',
        params: [['update', '--core-packages']]
      });
      console.info(result);
    } catch (err) {
      console.error('Failed to update PIO Core', err);
    }
  });
}

export default [
  watchShowAtStartup,
  watchNotifyError,
  watchNotifySuccess,
  watchUpdateRouteBadge,
  watchOSRequests,
  watchRequestContent,
  watchOsFSGlob,
  watchLoadLogicalDevices,
  watchOsListDir,
  watchOsIsFile,
  watchOsIsDir,
  watchResetFSItems,
  watchToggleFavoriteFolder,
  watchSendFeedback,
  watchAutoUpdateCorePackages
];
