/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { notifyError } from '../modules/core/actions';


export function crashReporterMiddleware(store) {
  return next => action => {
    try {
      return next(action);
    } catch (err) {
      console.error('Internal Store Exception', err);
      store.dispatch(notifyError('Internal Store Exception', err));
      throw err;
    }
  };
}
