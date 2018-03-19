/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { createAction } from '../../store/actions';


export const LOAD_LATEST_TWEETS = 'LOAD_LATEST_TWEETS';

export const loadLatestTweets = (username) => createAction(LOAD_LATEST_TWEETS, { username });
