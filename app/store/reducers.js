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

import * as ActionTypes from './actions';

import { combineReducers } from 'redux';

export function copyWithoutMatchingKeys(obj, re) {
  const newObj = Object.assign({}, obj);
  Object.keys(newObj).forEach((key) => {
    if (re.test(key)) {
      delete newObj[key];
    }
  });
  return newObj;
}

function router(state = null, action) {
  if (action.type !== ActionTypes.CONNECT_ROUTER) {
    return state;
  }
  return action.router;
}

function entities(state = {}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_ENTITY:
      return Object.assign({}, state, {
        [action.key]: action.data,
      });

    case ActionTypes.DELETE_ENTITY:
      return copyWithoutMatchingKeys(state, action.re);
  }
  return state;
}

function inputValues(state = {}, action) {
  if (action.type === ActionTypes.UPDATE_INPUT_VALUE) {
    const newState = Object.assign({}, state, {
      [action.key]: action.value,
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
        [action.key]: action.data,
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
  storage,
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
