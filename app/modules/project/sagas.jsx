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
import * as pathlib from '@core/path';
import * as selectors from './selectors';

import {
  CONFIG_SCHEMA_KEY,
  PROJECT_CONFIG_KEY,
  PROJECT_CONFIG_SAVE_CONSENT_ID
} from '@project/constants';
import {
  INSTALL_PLATFORM,
  UNINSTALL_PLATFORM,
  UPDATE_PLATFORM
} from '../platform/actions';
import { Modal, message } from 'antd';
import {
  OS_RENAME_FILE,
  // ensureUserConsent,
  notifyError,
  notifySuccess,
  osRevealFile
} from '../core/actions';
import { call, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import {
  deleteEntity,
  saveState,
  updateEntity,
  updateStorageItem
} from '../../store/actions';
import { selectEntity, selectStorageItem } from '../../store/selectors';

import { ConfigFileModifiedError } from '@project/errors';
import { ConsentRejectedError } from '@core/errors';
import React from 'react';
import ReactGA from 'react-ga';
import { apiFetchData } from '../../store/api';
import { ensureUserConsent } from '@core/sagas';
import { getSessionId } from '@core/helpers';
import jsonrpc from 'jsonrpc-lite';

const RECENT_PROJECTS_STORAGE_KEY = 'recentProjects';

function* watchAddProject() {
  yield takeEvery(actions.ADD_PROJECT, function*({ projectDir, withOpen, onEnd }) {
    const iniPath = pathlib.join(projectDir, 'platformio.ini');
    const fileExists = yield call(apiFetchData, {
      query: 'os.is_file',
      params: [iniPath]
    });
    if (!fileExists) {
      if (onEnd) {
        yield call(
          onEnd,
          'This is not PlatformIO Project (should contain "platformio.ini" file).',
          projectDir
        );
      }
      return;
    }

    const result = (yield select(selectStorageItem, RECENT_PROJECTS_STORAGE_KEY)) || [];
    if (!result.includes(projectDir)) {
      yield put(
        updateStorageItem(RECENT_PROJECTS_STORAGE_KEY, [...result, projectDir])
      );
      yield put(saveState());
    }
    yield put(deleteEntity(/^projects/));
    yield put(actions.loadProjects());
    if (withOpen) {
      yield put(actions.openProject(projectDir));
    }
    if (onEnd) {
      yield call(onEnd, undefined, projectDir);
    }
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
    yield put(saveState());
    yield put(
      updateEntity(
        'projects',
        entityItems.filter(item => item.path !== projectDir)
      )
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
    yield put(saveState());
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
        params: [getSessionId(), projectDir]
      });
    } catch (err) {
      console.warn(err);
      yield put(osRevealFile(projectDir));
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
    const { force = false } = yield take(actions.LOAD_PROJECTS) || {};
    let items;
    if (!force) {
      items = yield select(selectors.selectProjects);
      if (items) {
        yield put(actions.projectsLoaded());
        continue;
      }
    }
    try {
      items = yield call(apiFetchData, {
        query: 'project.get_projects'
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

function* watchLoadConfigSchema() {
  yield takeLatest(actions.LOAD_CONFIG_SCHEMA, function*() {
    try {
      const schema = yield call(apiFetchData, {
        query: 'project.get_config_schema'
      });
      // group by scope to pass to section without extra processing
      const schemaByScope = {};
      for (const item of schema) {
        const { scope } = item;
        if (!schemaByScope[scope]) {
          schemaByScope[scope] = [];
        }
        schemaByScope[scope].push(item);
      }
      yield put(updateEntity(CONFIG_SCHEMA_KEY, schemaByScope));
    } catch (e) {
      if (!(e instanceof jsonrpc.JsonRpcError)) {
        yield put(notifyError('Could not load config schema', e));
      }
    }
  });
}

function* watchLoadProjectConfig() {
  yield takeLatest(actions.LOAD_PROJECT_CONFIG, function*({ projectDir }) {
    try {
      yield put(deleteEntity(new RegExp(`^${PROJECT_CONFIG_KEY}$`), config));
      const configPath = pathlib.join(projectDir, 'platformio.ini');
      const tupleConfig = yield call(apiFetchData, {
        query: 'project.config_load',
        params: [configPath]
      });
      const mtime = yield call(apiFetchData, {
        query: 'os.get_file_mtime',
        params: [configPath]
      });
      const config = tupleConfig.map(([section, items]) => ({
        section,
        items: items.map(([name, value]) => ({
          name,
          value
        }))
      }));
      yield put(updateEntity(PROJECT_CONFIG_KEY, { config, mtime }));
    } catch (e) {
      yield put(notifyError('Could not load project config', e));
    }
  });
}

function* watchSaveProjectConfig() {
  yield takeLatest(actions.SAVE_PROJECT_CONFIG, function*({
    projectDir,
    data,
    options,
    onEnd
  }) {
    const { mtime, force } = options || {};
    let error;
    try {
      yield call(ensureUserConsent, PROJECT_CONFIG_SAVE_CONSENT_ID, {
        content: `Warning!
          The entire file contents or platformio.ini will be rewritten with the current
          configuration defined in this UI.
          Continue to save the configuration?`,
        okText: 'Save'
      });
      const configPath = pathlib.join(projectDir, 'platformio.ini');
      if (!force) {
        const currentMtime = yield call(apiFetchData, {
          query: 'os.get_file_mtime',
          params: [configPath]
        });
        if (currentMtime - mtime > 0.00001) {
          throw new ConfigFileModifiedError({
            loadedAt: mtime,
            modifiedAt: currentMtime
          });
        }
      }

      yield call(apiFetchData, {
        query: 'project.config_dump',
        params: [configPath, data]
      });
      message.success('Project configuration saved');
      // Refresh mtime
      const newMtime = yield call(apiFetchData, {
        query: 'os.get_file_mtime',
        params: [configPath]
      });
      const entity = yield select(selectEntity, PROJECT_CONFIG_KEY);
      yield put(updateEntity(PROJECT_CONFIG_KEY, { ...entity, mtime: newMtime }));
      // Reload list because displaying of config required project in the state
      yield put(actions.loadProjects(true));
    } catch (e) {
      error = e;
      if (
        !(
          e &&
          (e instanceof ConsentRejectedError || e instanceof ConfigFileModifiedError)
        )
      ) {
        yield put(notifyError('Could not save project config', e));
      }
    } finally {
      yield call(onEnd, error);
    }
  });
}

function* _patchProjectState(path, patch) {
  const exProjects = (yield select(selectors.selectProjects)) || [];
  const exProject = exProjects.find(x => x.path === path);
  if (!exProject) {
    return;
  }
  const project = { ...exProject, ...patch };
  const projects = exProjects.map(p => (p === exProject ? project : p));
  yield put(updateEntity('projects', projects));
  return exProject;
}

function* watchUpdateConfigDescription() {
  yield takeLatest(actions.UPDATE_CONFIG_DESCRIPTION, function*({
    projectDir,
    description,
    onEnd
  }) {
    let err;
    let undo;
    try {
      // Patch existing state if loaded
      undo = yield _patchProjectState(projectDir, { description });

      // Patch file via RPC
      yield call(apiFetchData, {
        query: 'project.config_update_description',
        params: [pathlib.join(projectDir, 'platformio.ini'), description]
      });
      message.success('Project description is saved into configuration file');
    } catch (e) {
      err = e;
      yield put(notifyError('Could not update project description', e));
      // Rollback edit
      if (undo) {
        yield _patchProjectState(projectDir, { description: undo.description });
      }
      console.error(e);
    } finally {
      if (onEnd) {
        yield call(onEnd, err);
      }
    }
  });
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
  watchImportArduinoProject,
  watchLoadConfigSchema,
  watchLoadProjectConfig,
  watchSaveProjectConfig,
  watchUpdateConfigDescription
];
