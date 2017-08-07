/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { createAction } from '../../store/actions';


export const LOAD_ACCOUNT_INFO = 'LOAD_ACCOUNT_INFO';
export const LOGIN_ACCOUNT = 'LOGIN_ACCOUNT';
export const LOGOUT_ACCOUNT = 'LOGOUT_ACCOUNT';
export const REGISTER_ACCOUNT = 'REGISTER_ACCOUNT';
export const FORGOT_ACCOUNT = 'FORGOT_ACCOUNT';
export const PASSWORD_ACCOUNT = 'PASSWORD_ACCOUNT';
export const SHOW_ACCOUNT_TOKEN = 'SHOW_ACCOUNT_TOKEN';

export const loadAccountInfo = (extended=false) => createAction(LOAD_ACCOUNT_INFO, { extended });
export const loginAccount = (username, password, onEnd) => createAction(LOGIN_ACCOUNT, { username, password, onEnd });
export const logoutAccount = () => createAction(LOGOUT_ACCOUNT);
export const registerAccount = (username, onEnd) => createAction(REGISTER_ACCOUNT, { username, onEnd });
export const forgotAccountPassword = (username, onEnd) => createAction(FORGOT_ACCOUNT, { username, onEnd });
export const changeAccountPassword = (oldPassword, newPassword, onEnd) => createAction(PASSWORD_ACCOUNT, { oldPassword, newPassword, onEnd });
export const showAccountToken = (password, regenerate=false, onEnd) => createAction(SHOW_ACCOUNT_TOKEN, { password, regenerate, onEnd });
