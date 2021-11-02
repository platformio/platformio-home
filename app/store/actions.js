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

export function createAction(type, payload = {}) {
  return { type, ...payload };
}

export const CONNECT_ROUTER = 'CONNECT_ROUTER';

export const STORE_READY = 'STORE_READY';
export const LOAD_STORE = 'LOAD_STORE';
export const UPDATE_STORE = 'UPDATE_STORE';
export const RESET_STORE = 'RESET_STORE';
export const SAVE_STATE = 'SAVE_STATE';
export const STATE_SAVED = 'STATE_SAVED';

export const UPDATE_ENTITY = 'UPDATE_ENTITY';
export const DELETE_ENTITY = 'DELETE_ENTITY';
export const UPDATE_INPUT_VALUE = 'UPDATE_INPUT_VALUE';
export const LAZY_UPDATE_INPUT_VALUE = 'LAZY_UPDATE_INPUT_VALUE';

export const UPDATE_STORAGE_ITEM = 'UPDATE_STORAGE_ITEM';
export const DELETE_STORAGE_ITEM = 'DELETE_STORAGE_ITEM';

export const connectRouter = (router) => createAction(CONNECT_ROUTER, { router });

export const fireStoreReady = () => createAction(STORE_READY);
export const fireStateSaved = () => createAction(STATE_SAVED);
export const loadStore = () => createAction(LOAD_STORE);
export const updateStore = (newState) => createAction(UPDATE_STORE, { newState });
export const resetStore = () => createAction(RESET_STORE);
export const saveState = () => createAction(SAVE_STATE);

export const updateEntity = (key, data) => createAction(UPDATE_ENTITY, { key, data });
export const deleteEntity = (re) => createAction(DELETE_ENTITY, { re });
export const updateInputValue = (key, value) =>
  createAction(UPDATE_INPUT_VALUE, { key, value });
export const lazyUpdateInputValue = (key, value) =>
  createAction(LAZY_UPDATE_INPUT_VALUE, { key, value });

export const updateStorageItem = (key, data) =>
  createAction(UPDATE_STORAGE_ITEM, { key, data });
export const deleteStorageItem = (re) => createAction(DELETE_STORAGE_ITEM, { re });
