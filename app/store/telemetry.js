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

import * as path from '../modules/core/path';

import {
  HIDE_PROJECT,
  IMPORT_ARDUINO_PROJECT,
  IMPORT_PROJECT,
  INIT_PROJECT,
  OPEN_PROJECT
} from '../modules/project/actions';
import {
  INSTALL_LIBRARY,
  UNINSTALL_LIBRARY,
  UPDATE_LIBRARY
} from '../modules/library/actions';
import {
  INSTALL_PLATFORM,
  UNINSTALL_PLATFORM,
  UPDATE_PLATFORM
} from '../modules/platform/actions';
import { OS_OPEN_URL, SHOW_AT_STARTUP } from '../modules/core/actions';
import { select, takeEvery, takeLatest } from 'redux-saga/effects';

import ReactGA from 'react-ga';
import { STORE_READY } from './actions';
import { getStartLocation } from '../modules/core/helpers';
import { selectStorage } from './selectors';

function* watchActivateGA() {
  yield takeLatest(STORE_READY, function*() {
    const storage = yield select(selectStorage);
    if (
      !storage.cid ||
      (storage.coreSettings &&
        storage.coreSettings.enable_telemetry &&
        !storage.coreSettings.enable_telemetry.value)
    ) {
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
  const actions = [
    INSTALL_LIBRARY,
    UNINSTALL_LIBRARY,
    UPDATE_LIBRARY,
    INSTALL_PLATFORM,
    UNINSTALL_PLATFORM,
    UPDATE_PLATFORM
  ];
  yield takeEvery(actions, function(action) {
    let label = '';
    if (action.type.endsWith('_LIBRARY')) {
      label = action.lib || (action.pkgDir ? path.basename(action.pkgDir) : '');
    } else if (action.type.endsWith('_PLATFORM')) {
      label = action.platform || (action.pkgDir ? path.basename(action.pkgDir) : '');
    }
    ReactGA.event({
      category: 'Package',
      action: action.type.toLowerCase(),
      label
    });
  });
}

function* watchProjectActions() {
  yield takeEvery(
    [IMPORT_ARDUINO_PROJECT, IMPORT_PROJECT, INIT_PROJECT, HIDE_PROJECT, OPEN_PROJECT],
    function(action) {
      let label = action.board || undefined;
      if (!label && action.projectDir) {
        label = path.join(
          path.basename(path.dirname(action.projectDir)),
          path.basename(action.projectDir)
        );
      }
      ReactGA.event({
        category: 'Project',
        action: action.type.toLowerCase(),
        label
      });
    }
  );
}

function* watchOutboundLinks() {
  yield takeEvery(OS_OPEN_URL, function({ url }) {
    ReactGA.event({
      category: 'Misc',
      action: 'Outbound',
      label: url
    });
  });
}

function* watchShowAtStartup() {
  yield takeEvery(SHOW_AT_STARTUP, function({ value }) {
    ReactGA.event({
      category: 'Misc',
      action: 'ShowAtStartup',
      label: value ? 1 : 0
    });
  });
}

export default [
  watchActivateGA,
  watchPackageActions,
  watchProjectActions,
  watchOutboundLinks,
  watchShowAtStartup
];
