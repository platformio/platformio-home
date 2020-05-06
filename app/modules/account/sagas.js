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

/* eslint-disable no-constant-condition */

import * as actions from './actions';
import * as selectors from './selectors';

import { call, put, select, take, takeLatest } from 'redux-saga/effects';
import { deleteEntity, updateEntity } from '../../store/actions';
import { notifyError, notifySuccess, osOpenUrl } from '../core/actions';

import { apiFetchData } from '../../store/api';
import { inIframe } from '../core/helpers';
import jsonrpc from 'jsonrpc-lite';
import { message } from 'antd';
import qs from 'querystringify';

const ACCOUNTS_AUTH_OPENID_ENDPOINT =
  'https://auth.accounts.platformio.org/auth/realms/pioaccount/protocol/openid-connect/auth';
const ACCOUNTS_AUTH_CLIENT_ID = 'pio-user-api';

function showAPIErrorMessage(output) {
  output = output.replace(/[\\r\\n]+\'/, '').trim();
  return message.error(output);
}

function getRedirectUri() {
  const currentSearch = qs.parse(window.location.search || '');
  currentSearch.start = '/account';
  const currentLocation =
    window.location.origin +
    window.location.pathname +
    qs.stringify(currentSearch, true);
  return currentLocation + `&piohomeacc_uri=${encodeURIComponent(currentLocation)}`;
}

function* watchLoadAccountInfo() {
  while (true) {
    const { extended } = yield take(actions.LOAD_ACCOUNT_INFO);
    let data = yield select(selectors.selectAccountInfo);
    if (data && (!extended || data.groups)) {
      continue;
    }

    if (window.location && window.location.search) {
      const locSearch = qs.parse(window.location.search);
      if (locSearch && locSearch.code && locSearch.piohomeacc_uri) {
        window.history.pushState(
          {},
          document.title,
          decodeURIComponent(locSearch.piohomeacc_uri)
        );
        yield call(
          loginAccountWithCode,
          locSearch.code,
          getRedirectUri()
        );
      }
    }

    try {
      data = yield call(apiFetchData, {
        query: 'core.call',
        params: [
          ['account', 'show', '--json-output', ...(extended ? [] : ['--offline'])]
        ]
      });
    } catch (err) {
      if (
        !(
          err instanceof jsonrpc.JsonRpcError &&
          err.data.includes('Error: You are not')
        )
      ) {
        yield put(notifyError('Could not load PIO Account information', err));
      }
    }
    yield put(updateEntity('accountInfo', data || {}));
  }
}

function* watchLoginAccount() {
  yield takeLatest(actions.LOGIN_ACCOUNT, function*({ username, password, onEnd }) {
    try {
      yield call(apiFetchData, {
        query: 'core.call',
        params: [['account', 'login', '--username', username, '--password', password]]
      });
      yield put(deleteEntity(/^accountInfo/));
    } catch (err) {
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not log in PIO Account', err));
    } finally {
      if (onEnd) {
        yield call(onEnd);
      }
    }
  });
}

function* watchLoginWithProvider() {
  yield takeLatest(actions.LOGIN_WITH_PROVIDER, function*({ provider }) {
    const scopeList = 'openid offline_access email profile';
    const url = `${ACCOUNTS_AUTH_OPENID_ENDPOINT}?client_id=${encodeURIComponent(
      ACCOUNTS_AUTH_CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      getRedirectUri()
    )}&response_type=code&scope=${encodeURIComponent(
      scopeList
    )}&kc_idp_hint=${encodeURIComponent(provider)}`;
    if (inIframe()) {
      yield put(osOpenUrl(url));
    } else {
      window.location = url;
    }
  });
}

function* loginAccountWithCode(code, redirectUri) {
  try {
    yield call(apiFetchData, {
      query: 'account.call_client',
      params: ['login_with_code', code, redirectUri]
    });
  } catch (err) {
    if (err && err.data) {
      return showAPIErrorMessage(err.data);
    }
    return yield put(notifyError('Could not log in PIO Account', err));
  }
}

function* watchLogoutAccount() {
  yield takeLatest(actions.LOGOUT_ACCOUNT, function*() {
    try {
      yield put(updateEntity('accountInfo', {}));
      yield call(apiFetchData, {
        query: 'core.call',
        params: [['account', 'logout']]
      });
    } catch (err) {
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not log out PIO Account', err));
    }
  });
}

function* watchRegisterAccount() {
  yield takeLatest(actions.REGISTER_ACCOUNT, function*({
    username,
    email,
    firstname,
    lastname,
    password,
    onEnd
  }) {
    let err = null;
    try {
      yield call(apiFetchData, {
        query: 'core.call',
        params: [
          [
            'account',
            'register',
            '--username',
            username,
            '--email',
            email,
            '--firstname',
            firstname,
            '--lastname',
            lastname,
            '--password',
            password
          ]
        ]
      });
      yield put(
        notifySuccess(
          'Congrats!',
          'Please check your email for the further instructions.'
        )
      );
    } catch (err_) {
      err = err_;
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not create PIO Account', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err);
      }
    }
  });
}

function* watchForgotAccount() {
  yield takeLatest(actions.FORGOT_ACCOUNT, function*({ username, onEnd }) {
    let err = null;
    try {
      yield call(apiFetchData, {
        query: 'core.call',
        params: [['account', 'forgot', '--username', username]]
      });
      yield put(
        notifySuccess(
          'Congrats!',
          'If this account is registered, we will send the further instructions to your email.'
        )
      );
    } catch (err_) {
      err = err_;
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not forgot password for PIO Account', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err);
      }
    }
  });
}

function* watchPasswordAccount() {
  yield takeLatest(actions.PASSWORD_ACCOUNT, function*({
    oldPassword,
    newPassword,
    onEnd
  }) {
    let err = null;
    try {
      yield call(apiFetchData, {
        query: 'core.call',
        params: [
          [
            'account',
            'password',
            '--old-password',
            oldPassword,
            '--new-password',
            newPassword
          ]
        ]
      });
      yield put(notifySuccess('Congrats!', 'Successfully updated password!'));
    } catch (err_) {
      err = err_;
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not change password for PIO Account', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err);
      }
    }
  });
}

function* watchTokenAccount() {
  yield takeLatest(actions.SHOW_ACCOUNT_TOKEN, function*({
    password,
    regenerate,
    onEnd
  }) {
    try {
      const args = ['account', 'token', '--json-output', '--password', password];
      if (regenerate) {
        args.push('--regenerate');
      }
      const data = yield call(apiFetchData, {
        query: 'core.call',
        params: [args]
      });
      yield put(updateEntity('accountToken', data.result || null));
    } catch (err) {
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not fetch PIO Account token', err));
    } finally {
      if (onEnd) {
        yield call(onEnd);
      }
    }
  });
}

function* watchUpdateProfile() {
  yield takeLatest(actions.UPDATE_PROFILE, function*({
    username,
    email,
    firstname,
    lastname,
    currentPassword,
    onEnd
  }) {
    let err = null;
    try {
      const response = yield call(apiFetchData, {
        query: 'core.call',
        params: [
          [
            'account',
            'update',
            '--username',
            username,
            '--email',
            email,
            '--firstname',
            firstname,
            '--lastname',
            lastname,
            '--current-password',
            currentPassword
          ]
        ]
      });
      yield put(actions.loadAccountInfo(true));
      if (response.includes('re-login')) {
        yield put(updateEntity('accountInfo', {}));
        if (response.includes('check your mail')) {
          yield put(
            notifySuccess(
              'Congrats!',
              'Successfully updated profile! Please check your mail to verify your new email address and re-login.'
            )
          );
          return;
        }
        yield put(
          notifySuccess('Congrats!', 'Successfully updated profile! Please re-login')
        );
        return;
      }
      yield put(notifySuccess('Congrats!', 'Successfully updated profile!'));
    } catch (err_) {
      err = err_;
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not update profile of PIO Account', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err);
      }
    }
  });
}

export default [
  watchLoadAccountInfo,
  watchLoginAccount,
  watchLoginWithProvider,
  watchLogoutAccount,
  watchRegisterAccount,
  watchForgotAccount,
  watchPasswordAccount,
  watchTokenAccount,
  watchUpdateProfile
];
