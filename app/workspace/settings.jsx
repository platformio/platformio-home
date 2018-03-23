/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import CustomIcon from '../modules/core/components/custom-icon';
import { Icon } from 'antd';
import React from 'react';

const workspaces = {
  'platformio': require('./platformio/index').default,
  'aceinna': require('./aceinna/index').default
};

let workspace = workspaces['platformio'];
const customWorkspaceName = getQueryVariable('workspace');
if (workspaces.hasOwnProperty(customWorkspaceName)) {
  workspace = workspaces[customWorkspaceName];
}

export function get(id, defaultValue=undefined) {
  if (workspace.hasOwnProperty(id)) {
    return workspace[id];
  }
  return defaultValue;
}

export function getMessage(id) {
  if (workspace.messages.hasOwnProperty(id)) {
    return workspace.messages[id];
  }
  return id;
}

export function getUrl(id) {
  return workspace.urls[id];
}

export function isBoardCertified(board) {
  return board.platform && board.platform.name === 'aceinna_imu';
}

export function getCustomIcon(type) {
  if (workspace.remapCustomIcons && workspace.remapCustomIcons.hasOwnProperty(type)) {
    return <CustomIcon type={ workspace.remapCustomIcons[type] } />;
  }
  return <Icon type={ type } />;
}
