/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { put, take } from 'redux-saga/effects';

import SockJS from 'sockjs-client';
import { createAction } from './actions';
import jsonrpc from 'jsonrpc-lite';
import { message } from 'antd';


export const actions = {
  API_CONNECTED: 'API_CONNECTED',
  API_DISCONNECTED: 'API_DISCONNECTED',
  API_ERRORED: 'API_ERRORED',
  API_REQUEST: 'API_REQUEST',
  API_RESULT_SUCCESS: 'API_RESULT_SUCCESS',
  API_RESULT_ERROR: 'API_RESULT_ERROR'
};

actions.apiRequest = (id, query, params) => createAction(actions.API_REQUEST, {
  id,
  query,
  params
});

export function* apiFetchData({ query, params = [] }) {
  const id = Math.random().toString();
  yield put(actions.apiRequest(id, query, params));
  /* eslint-disable no-constant-condition */
  while (true) {
    const action = yield take([actions.API_RESULT_SUCCESS, actions.API_RESULT_ERROR]);
    if (action.id !== id) {
      continue;
    }
    if (action.type === actions.API_RESULT_ERROR) {
      throw action.error;
    }
    return action.result;
  }
}

export function apiMiddleware(options) {
  return (store) => {
    let socket = null;
    let messageQueue = [];
    const reconnect = {
      timer: null,
      loading: null,
      delay: 500,  // msec
      maxDelay: 10000,  // msec
      retries: 0
    };

    function newSocket(endpoint) {
      if (reconnect.timer) {
        clearTimeout(reconnect.timer);
      }
      const sock = new SockJS(endpoint);

      sock.onopen = () => {
        reconnect.retries = 0;
        if (reconnect.loading) {
          reconnect.loading();
        }

        store.dispatch(createAction(actions.API_CONNECTED));
        const _messageQueue = messageQueue.slice(0);
        messageQueue = []; // reset messageQueue
        _messageQueue.forEach(data => sock.send(data));
      };

      sock.onclose = () => {
        store.dispatch(createAction(actions.API_DISCONNECTED));
        // reconnect
        if (!reconnect.loading) {
          reconnect.loading = message.loading('Reconnecting...', 0);
        }

        reconnect.retries++;
        reconnect.interval = setTimeout(
          () => socket = newSocket(endpoint),
          Math.min(reconnect.delay * reconnect.retries, reconnect.maxDelay)
        );
      };

      sock.onmessage = event => {
        try {
          const result = jsonrpc.parse(event.data);
          switch (result.type) {
            case 'success':
              return store.dispatch(createAction(actions.API_RESULT_SUCCESS, result.payload));
            case 'error':
              return store.dispatch(createAction(actions.API_RESULT_ERROR, result.payload));
          }
        } catch (err) {
          store.dispatch(createAction(actions.API_ERRORED, err));
        }
      };
      return sock;
    }

    socket = newSocket(options.endpoint);
    return next => action => {
      if (action && action.type === actions.API_REQUEST) {
        const msg = JSON.stringify(jsonrpc.request(action.id, action.query, action.params));
        return socket.readyState === SockJS.OPEN ? socket.send(msg) : messageQueue.push(msg);
      }
      return next(action);
    };
  };
}

