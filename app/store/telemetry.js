/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition, no-case-declarations */

import * as path from '../modules/core/path';

import { select, takeEvery, takeLatest } from 'redux-saga/effects';

import ReactGA from 'react-ga';
import { STORE_READY } from './actions';
import { getStartLocation } from '../modules/core/helpers';
import { selectStorage } from './selectors';


function* watchActivateGA() {
  yield takeLatest(STORE_READY, function*() {
    const storage = yield select(selectStorage);
    if (!storage.cid) {
      return;
    }
    ReactGA.initialize('UA-1768265-9', {
      debug: process.env.NODE_ENV !== 'production',
      titleCase: false,
      gaOptions: {
        clientId: storage.cid
      }
    });

    let appName = `PlatformIO/${storage.coreVersion}`;
    if (storage.coreCaller) {
      appName += `Caller/${storage.coreCaller}`;
    }

    const options = {
      appId: 'core.home',
      appVersion: APP_VERSION,
      appName,

      // Custom Dimension
      dimension1: storage.coreSystype,
      dimension4: 1 // human request, not subprocess
    };
    if (storage.coreCaller) {
      options.dimension5 = storage.coreCaller;
    }
    ReactGA.set(options);

    // send initial screen...
    ReactGA.ga('send', 'screenview', {
      screenName: getStartLocation()
    });
  });
}

function* watchPackageActions() {
  const re = new RegExp('^(install|uninstall|update)_(library|platform)', 'i');
  yield takeEvery('*', function (action) {
    if (!re.test(action.type)) {
      return;
    }
    let label = '';
    if (action.type.endsWith('_LIBRARY')) {
      label = action.lib || (action.pkgDir ? path.basename(action.pkgDir) : '');
    }
    else if (action.type.endsWith('_PLATFORM')) {
      label = action.platform || (action.pkgDir ? path.basename(action.pkgDir) : '');
    }
    ReactGA.event({
      category: 'Package',
      action: action.type.toLowerCase(),
      label
    });
  });
}

export default [
  watchActivateGA,
  watchPackageActions
];
