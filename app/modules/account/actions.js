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

import { createAction } from '../../store/actions';

export const LOAD_ACCOUNT_INFO = 'LOAD_ACCOUNT_INFO';
export const LOGIN_ACCOUNT = 'LOGIN_ACCOUNT';
export const LOGIN_WITH_PROVIDER = 'LOGIN_WITH_PROVIDER';
export const LOGOUT_ACCOUNT = 'LOGOUT_ACCOUNT';
export const REGISTER_ACCOUNT = 'REGISTER_ACCOUNT';
export const FORGOT_ACCOUNT = 'FORGOT_ACCOUNT';
export const PASSWORD_ACCOUNT = 'PASSWORD_ACCOUNT';
export const UPDATE_PROFILE = 'UPDATE_PROFILE';
export const SHOW_ACCOUNT_TOKEN = 'SHOW_ACCOUNT_TOKEN';

export const loadAccountInfo = (extended = false) =>
  createAction(LOAD_ACCOUNT_INFO, { extended });
export const loginAccount = (username, password, onEnd) =>
  createAction(LOGIN_ACCOUNT, { username, password, onEnd });
export const logoutAccount = () => createAction(LOGOUT_ACCOUNT);
export const loginWithProvider = provider =>
  createAction(LOGIN_WITH_PROVIDER, { provider });
export const registerAccount = (
  username,
  email,
  firstname,
  lastname,
  password,
  onEnd
) =>
  createAction(REGISTER_ACCOUNT, {
    username,
    email,
    firstname,
    lastname,
    password,
    onEnd
  });
export const updateProfile = (
  username,
  email,
  firstname,
  lastname,
  currentPassword,
  onEnd
) =>
  createAction(UPDATE_PROFILE, {
    username,
    email,
    firstname,
    lastname,
    currentPassword,
    onEnd
  });
export const forgotAccountPassword = (username, onEnd) =>
  createAction(FORGOT_ACCOUNT, { username, onEnd });
export const changeAccountPassword = (oldPassword, newPassword, onEnd) =>
  createAction(PASSWORD_ACCOUNT, { oldPassword, newPassword, onEnd });
export const showAccountToken = (password, regenerate = false, onEnd) =>
  createAction(SHOW_ACCOUNT_TOKEN, { password, regenerate, onEnd });
