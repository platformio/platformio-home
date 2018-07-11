/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as ActionTypes from './actions';

import { combineReducers } from 'redux';


export function copyWithoutMatchingKeys(obj, re) {
  const newObj = Object.assign({}, obj);
  Object.keys(newObj).forEach(key => {
    if (re.test(key)) {
      delete newObj[key];
    }
  });
  return newObj;
}

function router(state = {}, action) {
  if (action.type !== ActionTypes.CONNECT_ROUTER) {
    return state;
  }
  return action.router;
}

function entities(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_ENTITY:
      return Object.assign({}, state, {
        [action.key]: action.data
      });

    case ActionTypes.DELETE_ENTITY:
      return copyWithoutMatchingKeys(state, action.re);
  }
  return state;
}

function inputValues(state = {}, action) {
  if (action.type === ActionTypes.UPDATE_INPUT_VALUE) {
    const newState = Object.assign({}, state, {
      [action.key]: action.value
    });
    if (!newState[action.key]) {
      delete newState[action.key];
    }
    return newState;
  }
  return state;
}

function storage(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_STORAGE_ITEM:
      return Object.assign({}, state, {
        [action.key]: action.data
      });

    case ActionTypes.DELETE_STORAGE_ITEM:
      return copyWithoutMatchingKeys(state, action.re);
  }
  return state;
}

const appReducer = combineReducers({
  router,
  entities,
  inputValues,
  storage
});

function rootReducer(state, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_STORE:
      return Object.assign({}, appReducer(state, action), action.newState);

    case ActionTypes.RESET_STORE:
      return {};
  }
  return appReducer(state, action);
}

export default rootReducer;
