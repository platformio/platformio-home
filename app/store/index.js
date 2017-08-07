/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
    sagaMiddleware,
    apiMiddleware({
      endpoint: BACKEND_ENDPOINT
    })
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
