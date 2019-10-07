/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { createAction } from '../../store/actions';


export const TMP_SAVE_DATASIZE_JSON = 'TMP_SAVE_DATASIZE_JSON';

export const saveTmpDatasize = (data) => createAction(TMP_SAVE_DATASIZE_JSON, data);
