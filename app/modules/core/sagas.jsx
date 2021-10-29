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

/* eslint-disable no-constant-condition, no-case-declarations */

import * as actions from './actions';
import * as selectors from './selectors';

import { Button, Modal, message, notification } from 'antd';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { deleteEntity, updateEntity, updateStorageItem } from '../../store/actions';
import { inIframe, reportException } from './helpers';

import { ConsentRejectedError } from '@core/errors';
import React from 'react';
import URL from 'url-parse';
import { USER_CONSENTS_KEY } from '@core/constants';
import { backendFetchData } from '../../store/backend';
import { getStore } from '../../store/index';
import jsonrpc from 'jsonrpc-lite';
import qs from 'querystringify';
import requests from 'superagent';
import { selectStorageItem } from '../../store/selectors';

const REQUESTED_CONTENTS_CACHE_SIZE = 50;
const OS_FS_GLOBS_CACHE_SIZE = 50;

function* watchShowAtStartup() {
  yield takeEvery(actions.SHOW_AT_STARTUP, function* ({ value }) {
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
  function _openUrl(url) {
    return getStore().dispatch(actions.osOpenUrl(url));
  }

  yield takeEvery(actions.NOTIFY_ERROR, function ({ title, err }) {
    if (!err) {
      return;
    }
    console.error(title, err);
    let description = err.stack || err.toString();
    if (err instanceof jsonrpc.JsonRpcError) {
      description = err.message;
      if (err.data) {
        description += ': ' + JSON.stringify(err.data);
      }
    }
    const knownIssues = [
      [
        /toolchain-gccarmlinuxgnueabi|WiringPi/g,
        'https://github.com/platformio/platform-linux_arm/issues/2',
      ],
      [
        /\[Error 2\]|\[WinError 2\]|\[Errno 13\]/g,
        'https://github.com/platformio/platformio-core/issues/2321',
      ],
      [
        /Please try this solution -> http:\/\/bit.ly\/faq-package-manager/g,
        'http://bit.ly/faq-package-manager',
      ],
      [
        /Please install Git client/g,
        'https://github.com/platformio/platformio-core/issues/2811',
      ],
      [
        /Error: You are not connected to the Internet|HTTPSConnectionPool/g,
        'https://github.com/platformio/platformio-core/issues/1348',
      ],
      [
        /Updating.+VCS.+recurse-submodules/g,
        'https://github.com/platformio/platformio-home/issues/143',
      ],
      [
        /Error: Detected a whitespace character/g,
        'https://github.com/platformio/platform-espressif32/issues/470',
      ],
      [
        /Error: Could not find the package/g,
        'https://github.com/platformio/platformio-home/issues/2144',
      ],
      [
        /Error: Unknown development platform/g,
        'https://github.com/platformio/platformio-home/issues/2123',
      ],
      [
        /Error: Unknown board ID/g,
        'https://github.com/platformio/platformio-home/issues/1768',
      ],
      [
        /Error: Could not find one of .* manifest files/g,
        'https://github.com/platformio/platformio-home/issues/1785',
      ],
    ];
    for (const [regex, url] of knownIssues) {
      if (description.match(regex)) {
        return notification.warning({
          message: title,
          description,
          duration: 0,
          btn: (
            <Button type="danger" onClick={() => _openUrl(url)}>
              Check available solutions
            </Button>
          ),
        });
      }
    }

    notification.error({
      message: title,
      description,
      duration: 0,
      btn: (
        <Button
          type="danger"
          onClick={() =>
            _openUrl(
              `https://github.com/platformio/platformio-home/issues/new?${qs.stringify({
                title,
                body: description,
              })}`
            )
          }
        >
          Report a problem
        </Button>
      ),
    });
    reportException(`${title} => ${description}`);
  });
}

function* watchNotifySuccess() {
  yield takeEvery(actions.NOTIFY_SUCCESS, function ({ title, result }) {
    if (!result) {
      return;
    }
    console.info(title, result);
    if (result.length > 255) {
      Modal.success({
        title,
        content: (
          <div>
            {result.split('\n').map((text, index) => (
              <div key={index}>{text}</div>
            ))}
          </div>
        ),
      });
    } else {
      notification.success({
        message: title,
        description: result,
      });
    }
  });
}

function* watchUpdateRouteBadge() {
  const itemKey = 'routeBadges';
  yield takeEvery(actions.UPDATE_ROUTE_BADGE, function* ({ path, count }) {
    const result = (yield select(selectStorageItem, itemKey)) || {};
    result[path] = parseInt(count);
    if (result[path] === 0) {
      delete result[path];
    }
    yield put(updateStorageItem(itemKey, result));
  });
}

function* watchOSRequests() {
  yield takeEvery(
    [
      actions.OS_OPEN_URL,
      actions.OS_REVEAL_FILE,
      actions.OS_RENAME_FILE,
      actions.OS_MAKE_DIRS,
      actions.OS_COPY_FILE,
    ],
    function* (action) {
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
              yield call(backendFetchData, {
                query: 'os.open_url',
                params: [url.toString()],
              });
            }
            break;

          case actions.OS_REVEAL_FILE:
            yield call(backendFetchData, {
              query: 'os.reveal_file',
              params: [action.path],
            });
            break;

          case actions.OS_RENAME_FILE:
            yield call(backendFetchData, {
              query: 'os.rename',
              params: [action.src, action.dst],
            });
            break;

          case actions.OS_COPY_FILE:
            yield call(backendFetchData, {
              query: 'os.copy',
              params: [action.src, action.dst],
            });
            break;

          case actions.OS_MAKE_DIRS:
            yield call(backendFetchData, {
              query: 'os.make_dirs',
              params: [action.path],
            });
            break;
        }
      } catch (err) {
        return yield put(actions.notifyError(action.type, err));
      }
    }
  );
}

function* watchRequestContent() {
  const crossDomains = [
    'api.github.com',
    'raw.githubusercontent.com',
    'platformio.org',
  ];
  yield takeEvery(
    actions.REQUEST_CONTENT,
    function* ({ uri, data, headers, cacheValid }) {
      let content = yield select(selectors.selectRequestedContent, uri, data);
      if (content) {
        return;
      }
      try {
        if (uri.startsWith('http') && crossDomains.some((d) => uri.includes(d))) {
          content = yield call(() => {
            const r = data ? requests.post(uri).send(data) : requests.get(uri);
            if (headers) {
              r.set(headers);
            }
            return new Promise((resolve) => {
              r.end((err, result) =>
                err || !result.ok ? resolve(undefined) : resolve(result.text)
              );
            });
          });
        }

        if (!content) {
          content = yield call(backendFetchData, {
            query: 'os.request_content',
            params: [uri, data, headers, cacheValid],
          });
        }

        const contents = (yield select(selectors.selectRequestedContents)) || [];
        contents.push({
          key: selectors.getRequestContentKey(uri, data),
          content,
        });
        yield put(
          updateEntity(
            'requestedContents',
            contents.slice(REQUESTED_CONTENTS_CACHE_SIZE * -1)
          )
        );
      } catch (err) {
        return yield put(
          actions.notifyError(
            'Error occurred while requesting content from ' + uri,
            err
          )
        );
      }
    }
  );
}

function* watchOsFSGlob() {
  yield takeEvery(actions.OS_FS_GLOB, function* ({ pathnames, rootDir }) {
    let items = yield select(selectors.selectOsFSGlob, pathnames, rootDir);
    if (items) {
      return;
    }
    try {
      items = yield call(backendFetchData, {
        query: 'os.glob',
        params: [pathnames, rootDir],
      });
      const current = (yield select(selectors.selectOsFSGlobs)) || [];
      current.push({
        key: selectors.selectOsFSGlobKey(pathnames, rootDir),
        items,
      });
      yield put(updateEntity('osFsGlob', current.slice(OS_FS_GLOBS_CACHE_SIZE * -1)));
    } catch (err) {
      return yield put(
        actions.notifyError(
          'Error occurred while glob ' + JSON.stringify(pathnames),
          err
        )
      );
    }
  });
}

function* watchLoadLogicalDevices() {
  yield takeLatest(actions.LOAD_LOGICAL_DEVICES, function* ({ force }) {
    if (force) {
      yield put(deleteEntity(/^logicalDevices/));
    }
    let items = yield select(selectors.selectLogicalDevices);
    if (items) {
      return;
    }
    try {
      items = yield call(backendFetchData, {
        query: 'os.get_logical_devices',
      });
      yield put(updateEntity('logicalDevices', items));
    } catch (err) {
      return yield put(actions.notifyError('Could not load logical devices', err));
    }
  });
}

function* watchOsListDir() {
  yield takeEvery(actions.OS_LIST_DIR, function* ({ path }) {
    let items = yield select(selectors.selectOsDirItems);
    if (items && items[path]) {
      return;
    } else if (!items) {
      items = {};
    }
    try {
      const result = yield call(backendFetchData, {
        query: 'os.list_dir',
        params: [/^[A-Z]:$/.test(path) ? path + '\\' : path],
      });
      yield put(
        updateEntity('osDirItems', Object.assign({}, items, { [path]: result }))
      );
    } catch (err) {
      return yield put(actions.notifyError('Could not list directory' + path, err));
    }
  });
}

function* watchOsIsFile() {
  yield takeEvery(actions.OS_IS_FILE, function* ({ path }) {
    let items = yield select(selectors.selectOsIsFileItems);
    if (items && items[path]) {
      return;
    } else if (!items) {
      items = {};
    }
    try {
      const result = yield call(backendFetchData, {
        query: 'os.is_file',
        params: [path],
      });
      yield put(
        updateEntity('osIsFileItems', Object.assign({}, items, { [path]: result }))
      );
    } catch (err) {
      return yield put(actions.notifyError('Could not check is file ' + path, err));
    }
  });
}

function* watchOsIsDir() {
  yield takeEvery(actions.OS_IS_DIR, function* ({ path }) {
    let items = yield select(selectors.selectOsIsDirItems);
    if (items && items[path]) {
      return;
    } else if (!items) {
      items = {};
    }
    try {
      const result = yield call(backendFetchData, {
        query: 'os.is_dir',
        params: [path],
      });
      yield put(
        updateEntity('osIsDirItems', Object.assign({}, items, { [path]: result }))
      );
    } catch (err) {
      return yield put(
        actions.notifyError('Could not check is directory ' + path, err)
      );
    }
  });
}

function* watchResetFSItems() {
  yield takeLatest(actions.RESET_FS_ITEMS, function* () {
    yield put(updateEntity('osDirItems', null));
    yield put(updateEntity('osIsFileItems', null));
    yield put(updateEntity('osIsDirItems', null));
  });
}

function* watchToggleFavoriteFolder() {
  yield takeEvery(actions.TOGGLE_FAVORITE_FOLDER, function* ({ path }) {
    const items = (yield select(selectStorageItem, 'favoriteFolders')) || [];
    yield put(
      updateStorageItem(
        'favoriteFolders',
        items.includes(path) ? items.filter((item) => item !== path) : [...items, path]
      )
    );
  });
}

function* watchOpenTextDocument() {
  yield takeEvery(actions.OPEN_TEXT_DOCUMENT, function* ({ path, line, column }) {
    const is_file = yield call(backendFetchData, {
      query: 'os.is_file',
      params: [path],
    });
    if (!is_file) {
      return message.error(`File does not exist on disk ${path}`);
    }
    try {
      return yield call(backendFetchData, {
        query: 'ide.send_command',
        params: ['open_text_document', { path, line, column }],
      });
    } catch (err) {
      console.warn(err);
      return yield call(backendFetchData, {
        query: 'os.open_file',
        params: [path],
      });
    }
  });
}

export function* ensureUserConsent(id, modalOptions) {
  const consents = yield select(selectors.selectUserConsents);
  const consent = consents[id];
  if (!consent) {
    const showModal = () => {
      return new Promise((resolve, reject) => {
        Modal.confirm({
          title: 'Confirm',
          ...modalOptions,
          onOk: () => {
            resolve();
          },
          onCancel: () => {
            reject(new ConsentRejectedError());
          },
        });
      });
    };
    yield call(showModal);
    yield put(
      updateStorageItem(USER_CONSENTS_KEY, {
        ...consents,
        [id]: Date.now().valueOf(),
      })
    );
  }
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
  watchOpenTextDocument,
];
