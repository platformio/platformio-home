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
import { STORE_READY, updateEntity, updateStorageItem } from '../../store/actions';
import { inIframe, reportException } from './helpers';
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import React from 'react';
import ReactGA from 'react-ga';
import URL from 'url-parse';
import { apiFetchData } from '../../store/api';
import { getStore } from '../../store/index';
import qs from 'querystringify';
import requests from 'superagent';
import { selectStorageItem } from '../../store/selectors';


const REQUESTED_CONTENTS_CACHE_SIZE = 50;
const FS_GLOBS_CACHE_SIZE = 50;


function* watchNotifyError() {

  function reportIssue(title, body) {
    title = `Home: ${title}`;
    return getStore().dispatch(actions.openUrl(`https://github.com/platformio/platformio-core/issues/new?${ qs.stringify({title, body}) }`));
  }

  yield takeEvery(actions.NOTIFY_ERROR, function({title, err}) {
    if (!err) {
      return;
    }
    console.error(title, err);
    let description = err.stack || err.toString();
    if (err.name === 'JsonRpcError') {
      description = `${err.message}: ${err.data}`;
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
              <p key={ index }>
                { text }
              </p>)) }
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
  yield takeEvery([actions.OPEN_URL, actions.REVEAL_FILE], function*(action) {
    try {
      switch (action.type) {
        case actions.OPEN_URL:
        const isWebUrl = action.url.startsWith('http');
          const url = new URL(action.url, true);
          url.query.utm_source = 'platformio';
          url.query.utm_medium = 'piohome';

          if (isWebUrl && !inIframe()) {
            const redirectWindow = window.open(url.toString(), '_blank');
            redirectWindow.location;
          } else {
            yield call(apiFetchData, {
              query: 'os.openUrl',
              params: [url.toString()]
            });
          }

          if (isWebUrl) {
            // track outbound URLs
            ReactGA.event({
              category: 'Misc',
              action: 'Outbound',
              label: action.url
            });
          }
          break;

        case actions.REVEAL_FILE:
          yield call(apiFetchData, {
            query: 'os.revealFile',
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
          query: 'os.requestContent',
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
      return yield put(actions.notifyError('Error occured while requesting content from ' + uri, err));
    }
  });
}

function* watchFSGlob() {
  yield takeEvery(actions.FS_GLOB, function*({pathnames, rootDir}) {
    let items = yield select(selectors.selectFSGlob, pathnames, rootDir);
    if (items) {
      return;
    }
    try {
      items = yield call(apiFetchData, {
        query: 'os.glob',
        params: [pathnames, rootDir]
      });
      const current = (yield select(selectors.selectFSGlobs)) || [];
      current.push({
        key: selectors.selectFSGlobKey(pathnames, rootDir),
        items
      });
      yield put(updateEntity('fsGlob', current.slice(FS_GLOBS_CACHE_SIZE * -1)));
    } catch (err) {
      return yield put(actions.notifyError('Error occured while glob ' + JSON.stringify(pathnames), err));
    }
  });
}

function* watchSendFeedback() {
  yield takeLatest(actions.SEND_FEEDBACK, function*({body, onEnd}) {
    let err;
    try {
      body = body.trim().substr(0, 1000);
      yield call(apiFetchData, {
        query: 'os.requestContent',
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
  watchNotifyError,
  watchNotifySuccess,
  watchUpdateRouteBadge,
  watchOSRequests,
  watchFSGlob,
  watchRequestContent,
  watchSendFeedback,
  watchAutoUpdateCorePackages
];
