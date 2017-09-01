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

import { INSTALL_PLATFORM, UNINSTALL_PLATFORM, UPDATE_PLATFORM } from '../platform/actions';
import { call, put, select, take, takeEvery } from 'redux-saga/effects';
import { deleteEntity, saveState, updateEntity, updateStorageItem } from '../../store/actions';
import { notifyError, notifySuccess } from '../core/actions';

import { Modal } from 'antd';
import React from 'react';
import ReactGA from 'react-ga';
import { apiFetchData } from '../../store/api';
import { selectStorageItem } from '../../store/selectors';


const RECENT_PROJECTS_STORAGE_KEY = 'recentProjects';

function* watchAddProject() {
  yield takeEvery(actions.ADD_PROJECT, function*({projectDir}) {
    const result = (yield select(selectStorageItem, RECENT_PROJECTS_STORAGE_KEY)) || [];
    if (!result.includes(projectDir)) {
      yield put(updateStorageItem(RECENT_PROJECTS_STORAGE_KEY, [...result, projectDir]));
      yield put(saveState()); // force state saving when new project is opening in new window (VSCode issue)
    }
    yield put(deleteEntity(/^projects/));
    yield put(actions.loadProjects());
  });
}

function* watchHideProject() {
  yield takeEvery(actions.HIDE_PROJECT, function*({projectDir}) {
    const storageItems = (yield select(selectStorageItem, RECENT_PROJECTS_STORAGE_KEY)) || [];
    const entityItems = (yield select(selectors.selectProjects)) || [];
    yield put(updateStorageItem(RECENT_PROJECTS_STORAGE_KEY, storageItems.filter(item => item !== projectDir)));
    yield put(updateEntity('projects', entityItems.filter(item => item.path !== projectDir)));
  });
}

function* watchOpenProject() {
  yield takeEvery(actions.OPEN_PROJECT, function*({projectDir}) {
    try {
      const result = yield call(apiFetchData, {
        query: 'ide.open_project',
        params: [projectDir]
      });
      console.info(result);
    } catch (err) {
      Modal.success({
        title: 'Open Project...',
        content: (
        <div style={ { wordBreak: 'break-all' } }>
          <div className='block'>Project has been successfully configured and is located by this path: <code>{ projectDir }</code>.</div>
          You can open it with your favourite IDE or process with <kbd>platformio run</kbd> command.
        </div>
        )
      });
    }
  });
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

      yield put(notifySuccess('Project has been successfully imported', `Location: ${result}`));
    } catch (_err) {
      err = _err;
      yield put(notifyError('Could not import project', err));
    }
    finally {
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

      yield put(notifySuccess('Project has been successfully initialized', `Board: ${board}, framework: ${framework}, location: ${result}`));
    } catch (_err) {
      err = _err;
      yield put(notifyError('Could not initialize project', err));
    }
    finally {
      if (onEnd) {
        yield call(onEnd, err, result);
      }
    }
  }
}

function* watchImportArduinoProject() {
  while (true) {
    const { board, useArduinoLibs, arduinoProjectDir, onEnd } = yield take(actions.IMPORT_ARDUINO_PROJECT);
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

      yield put(notifySuccess('Project has been successfully imported', `Board: ${board}, new location: ${result}`));
    } catch (_err) {
      err = _err;
      yield put(notifyError('Could not import Arduino project', err));
    }
    finally {
      if (onEnd) {
        yield call(onEnd, err, result);
      }
    }
  }
}

export default [
  watchAddProject,
  watchHideProject,
  watchOpenProject,
  watchLoadProjects,
  watchLoadProjectExamples,
  watchCleanupProjectExamples,
  watchImportProject,
  watchInitProject,
  watchImportArduinoProject
];
