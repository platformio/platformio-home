/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export function selectAccountInfo(state) {
  return state.entities.accountInfo;
}

export function selectIsUserLogged(state) {
  const data = selectAccountInfo(state);
  return data && data.username ? true : false;
}

export function selectAccountToken(state) {
  return state.entities.accountToken;
}
