/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { createAction } from '../../store/actions';


export const LOAD_SERIAL_DEVICES = 'LOAD_SERIAL_DEVICES';
export const LOAD_MDNS_DEVICES = 'LOAD_MDNS_DEVICES';

export const loadSerialDevices = (force=false) => createAction(LOAD_SERIAL_DEVICES, { force });
export const loadMDNSDevices = (force=false) => createAction(LOAD_MDNS_DEVICES, { force });
