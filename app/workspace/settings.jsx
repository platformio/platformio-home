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

import CustomIcon from '../modules/core/components/custom-icon';
import { Icon } from 'antd';
import React from 'react';

const workspaces = {
  platformio: require('./platformio/index').default,
  aceinna: require('./aceinna/index').default,
};

const customWorkspaceName = getQueryVariable('workspace');
const workspace = workspaces[customWorkspaceName] || workspaces['platformio'];

export function get(id, defaultValue = undefined) {
  return workspace[id] || defaultValue;
}

export function getMessage(id) {
  return workspace.messages[id] || id;
}

export function getUrl(id, defaultValue = undefined) {
  return workspace.urls[id] || defaultValue;
}

export function isBoardCertified(board) {
  return board.platform && board.platform.name === 'aceinna_imu';
}

export function getCustomIcon(type) {
  if (workspace.remapCustomIcons && workspace.remapCustomIcons[type]) {
    return <CustomIcon type={workspace.remapCustomIcons[type]} />;
  }
  return <Icon type={type} />;
}
