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

import {
  INSTALL_PLATFORM,
  UNINSTALL_PLATFORM,
  UPDATE_PLATFORM
} from '../platform/actions';
import { Modal, message } from 'antd';
import { OS_RENAME_FILE, notifyError, notifySuccess } from '../core/actions';
import { call, put, select, take, takeEvery } from 'redux-saga/effects';
import {
  deleteEntity,
  saveState,
  updateEntity,
  updateStorageItem
} from '../../store/actions';

import React from 'react';
import ReactGA from 'react-ga';
import { apiFetchData } from '../../store/api';
import { getSessionId } from '../core/helpers';
import jsonrpc from 'jsonrpc-lite';
import { selectStorageItem } from '../../store/selectors';

const RECENT_PROJECTS_STORAGE_KEY = 'recentProjects';

function* watchAddProject() {
  yield takeEvery(actions.ADD_PROJECT, function*({ projectDir }) {
    const result = (yield select(selectStorageItem, RECENT_PROJECTS_STORAGE_KEY)) || [];
    if (!result.includes(projectDir)) {
      yield put(
        updateStorageItem(RECENT_PROJECTS_STORAGE_KEY, [...result, projectDir])
      );
      yield put(saveState()); // force state saving when new project is opening in new window (VSCode issue)
    }
    yield put(deleteEntity(/^projects/));
    yield put(actions.loadProjects());
  });
}

function* watchHideProject() {
  yield takeEvery(actions.HIDE_PROJECT, function*({ projectDir }) {
    const storageItems =
      (yield select(selectStorageItem, RECENT_PROJECTS_STORAGE_KEY)) || [];
    const entityItems = (yield select(selectors.selectProjects)) || [];
    yield put(
      updateStorageItem(
        RECENT_PROJECTS_STORAGE_KEY,
        storageItems.filter(item => item !== projectDir)
      )
    );
    yield put(
      updateEntity('projects', entityItems.filter(item => item.path !== projectDir))
    );
  });
}

function* watchProjectRename() {
  yield takeEvery(OS_RENAME_FILE, function*({ src, dst }) {
    const storageItems =
      (yield select(selectStorageItem, RECENT_PROJECTS_STORAGE_KEY)) || [];
    if (!storageItems.includes(src)) {
      return;
    }
    if (!storageItems.includes(dst)) {
      storageItems.push(dst);
    }
    yield put(
      updateStorageItem(
        RECENT_PROJECTS_STORAGE_KEY,
        storageItems.filter(item => item !== src)
      )
    );
    if (yield select(selectors.selectProjects)) {
      yield put(deleteEntity(/^projects/));
      yield put(actions.loadProjects());
    }
  });
}

function* watchOpenProject() {
  yield takeEvery(actions.OPEN_PROJECT, function*({ projectDir }) {
    try {
      return yield call(apiFetchData, {
        query: 'ide.open_project',
        params: [projectDir, getSessionId()]
      });
    } catch (err) {
      // Invalid params, PIO Core < 4.0.1b3
      if (err instanceof jsonrpc.JsonRpcError && jsonrpc.JsonRpcError.code === -32602) {
        try {
          return yield call(apiFetchData, {
            query: 'ide.open_project',
            params: [projectDir]
          });
        } catch (err2) {
          console.warn(err2);
        }
      }
    }
    Modal.success({
      title: 'Open Project...',
      content: (
        <div style={{ wordBreak: 'break-all' }}>
          <div className="block">
            Project has been successfully configured and is located by this path:{' '}
            <code>{projectDir}</code>.
          </div>
          You can open it with your favourite IDE or process with{' '}
          <kbd>platformio run</kbd> command.
        </div>
      )
    });
  });
}

export function* preloadProjects() {
  yield put(actions.loadProjects());
  yield take(actions.PROJECTS_LOADED);
}

function* watchLoadProjects() {
  while (true) {
    yield take(actions.LOAD_PROJECTS);
    let items = yield select(selectors.selectProjects);
    if (items) {
      yield put(actions.projectsLoaded());
      continue;
    }
    try {
      items = yield call(apiFetchData, {
        query: 'project.get_projects',
        params: [yield select(selectStorageItem, RECENT_PROJECTS_STORAGE_KEY)]
      });
      yield put(updateEntity('projects', items));
      yield put(actions.projectsLoaded());
    } catch (err) {
      yield put(notifyError('Could not load recent projects', err));
    }
  }
}

function* watchLoadProjectExamples() {
  while (true) {
    yield take(actions.LOAD_PROJECT_EXAMPLES);
    let items = yield select(selectors.selectProjectExamples);
    if (items) {
      continue;
    }
    try {
      items = yield call(apiFetchData, {
        query: 'project.get_project_examples'
      });
      yield put(updateEntity('projectExamples', items));
    } catch (err) {
      yield put(notifyError('Could not load project examples', err));
    }
  }
}

function* watchCleanupProjectExamples() {
  yield takeEvery([INSTALL_PLATFORM, UNINSTALL_PLATFORM, UPDATE_PLATFORM], function*() {
    yield put(deleteEntity(/^projectExamples/));
  });
}

function* watchImportProject() {
  while (true) {
    const { projectDir, onEnd } = yield take(actions.IMPORT_PROJECT);
    let err,
      result = null;
    try {
      const start = new Date().getTime();

      result = yield call(apiFetchData, {
        query: 'project.import_pio',
        params: [projectDir]
      });

      ReactGA.timing({
        category: 'Project',
        variable: 'import',
        value: new Date().getTime() - start,
        label: projectDir
      });

      yield put(
        notifySuccess('Project has been successfully imported', `Location: ${result}`)
      );
    } catch (_err) {
      err = _err;
      yield put(notifyError('Could not import project', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err, result);
      }
    }
  }
}

function* watchInitProject() {
  while (true) {
    const { board, framework, projectDir, onEnd } = yield take(actions.INIT_PROJECT);
    let err,
      result = null;
    try {
      const start = new Date().getTime();

      result = yield call(apiFetchData, {
        query: 'project.init',
        params: [board, framework, projectDir]
      });

      ReactGA.timing({
        category: 'Project',
        variable: 'init',
        value: new Date().getTime() - start,
        label: board
      });

      yield put(
        notifySuccess(
          'Project has been successfully initialized',
          `Board: ${board}, framework: ${framework}, location: ${result}`
        )
      );
    } catch (_err) {
      err = _err;
      yield put(notifyError('Could not initialize project', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err, result);
      }
    }
  }
}

function* watchImportArduinoProject() {
  while (true) {
    const { board, useArduinoLibs, arduinoProjectDir, onEnd } = yield take(
      actions.IMPORT_ARDUINO_PROJECT
    );
    let err,
      result = null;
    try {
      const start = new Date().getTime();

      result = yield call(apiFetchData, {
        query: 'project.import_arduino',
        params: [board, useArduinoLibs, arduinoProjectDir]
      });

      ReactGA.timing({
        category: 'Project',
        variable: 'import_arduino',
        value: new Date().getTime() - start,
        label: board
      });

      yield put(
        notifySuccess(
          'Project has been successfully imported',
          `Board: ${board}, new location: ${result}`
        )
      );
    } catch (_err) {
      err = _err;
      if (
        err instanceof jsonrpc.JsonRpcError &&
        err.message.includes('Not an Arduino project')
      ) {
        message.error(
          `${err.message} (Project should countain .ino or .pde file with the same name as project folder)`,
          10
        );
      } else {
        yield put(notifyError('Could not import Arduino project', err));
      }
    } finally {
      if (onEnd) {
        yield call(onEnd, err, result);
      }
    }
  }
}

export default [
  watchAddProject,
  watchHideProject,
  watchProjectRename,
  watchOpenProject,
  watchLoadProjects,
  watchLoadProjectExamples,
  watchCleanupProjectExamples,
  watchImportProject,
  watchInitProject,
  watchImportArduinoProject
];
