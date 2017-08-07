/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function createAction(type, payload = {}) {
  return { type, ...payload };
}

export const STORE_READY = 'STORE_READY';
export const LOAD_STORE = 'LOAD_STORE';
export const UPDATE_STORE = 'UPDATE_STORE';
export const RESET_STORE = 'RESET_STORE';

export const UPDATE_ENTITY = 'UPDATE_ENTITY';
export const DELETE_ENTITY = 'DELETE_ENTITY';
export const UPDATE_INPUT_VALUE = 'UPDATE_INPUT_VALUE';
export const LAZY_UPDATE_INPUT_VALUE = 'LAZY_UPDATE_INPUT_VALUE';

export const UPDATE_STORAGE_ITEM = 'UPDATE_STORAGE_ITEM';
export const DELETE_STORAGE_ITEM = 'DELETE_STORAGE_ITEM';


export const fireStoreReady = () => createAction(STORE_READY);
export const loadStore = () => createAction(LOAD_STORE);
export const updateStore = (newState) => createAction(UPDATE_STORE, { newState });
export const resetStore = () => createAction(RESET_STORE);

export const updateEntity = (key, data) => createAction(UPDATE_ENTITY, { key, data });
export const deleteEntity = re => createAction(DELETE_ENTITY, { re });
export const updateInputValue = (key, value) => createAction(UPDATE_INPUT_VALUE, { key, value });
export const lazyUpdateInputValue = (key, value, delay=0) => createAction(LAZY_UPDATE_INPUT_VALUE, { key, value, delay });

export const updateStorageItem = (key, data) => createAction(UPDATE_STORAGE_ITEM, { key, data });
export const deleteStorageItem = re => createAction(DELETE_STORAGE_ITEM, { re });
