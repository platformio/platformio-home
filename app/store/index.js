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

import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import { loadStore, resetStore } from './actions';

import { BACKEND_ENDPOINT } from '../config';
import { apiMiddleware } from './api';
import { crashReporterMiddleware } from './middlewares';
import rootReducer from './reducers';
import rootSaga from './sagas';

let storeInstance = null;

export function getStore() {
  if (!storeInstance) {
    configureStore();
  }
  return storeInstance;
}

export function configureStore(initialState) {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [
    crashReporterMiddleware,
    apiMiddleware({
      endpoint: BACKEND_ENDPOINT
    }),
    sagaMiddleware
  ];

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(require('redux-logger').logger);
  }

  const store = createStore(
    rootReducer,
    initialState || {},
    applyMiddleware(...middlewares)
  );
  store.close = () => store.dispatch(END);
  sagaMiddleware.run(rootSaga);
  storeInstance = store;

  store.dispatch(loadStore());

  return store;
}

export function destroyStore() {
  if (!storeInstance) {
    return;
  }
  storeInstance.dispatch(resetStore());
  storeInstance.close();
  storeInstance = null;
}
