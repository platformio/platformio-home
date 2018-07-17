/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { PIOPLUS_UPGRADE_COUPON } from '../../config';
import { selectStorageItem } from '../../store/selectors';


export function selectAccountInfo(state) {
  return state.entities.accountInfo;
}

export function selectIsUserLogged(state) {
  const data = selectAccountInfo(state);
  return data && data.username ? true : false;
}

export function selectUpgradeInfo(state) {
  const accountInfo = selectAccountInfo(state);
  if (!accountInfo || !accountInfo.upgradePlan) {
    return null;
  }
  const lucky = selectStorageItem(state, 'rafProLucky') || false;
  return {
    plan: accountInfo.upgradePlan,
    coupon: lucky ? PIOPLUS_UPGRADE_COUPON : undefined,
    buttonLabel: lucky ? `UPGRADE TODAY & SAVE ${PIOPLUS_UPGRADE_COUPON.substring(PIOPLUS_UPGRADE_COUPON.length - 2)}%` : 'UPGRADE',
    url: 'https://platformio.org/pricing?utm_campaign=account-upgrade' + (lucky ? `&coupon=${PIOPLUS_UPGRADE_COUPON}` : '')
  };
}

export function selectAccountToken(state) {
  return state.entities.accountToken;
}
