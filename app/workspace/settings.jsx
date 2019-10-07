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

export function getUrl(id, defaultValue=undefined) {
  if (workspace.urls.hasOwnProperty(id)) {
    return workspace.urls[id];
  }
  return defaultValue;
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
