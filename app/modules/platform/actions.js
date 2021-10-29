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

import { createAction } from '../../store/actions';

export const LOAD_BOARDS = 'LOAD_BOARDS';
export const LOAD_REGISTRY_PLATFORMS = 'LOAD_REGISTRY_PLATFORMS';
export const LOAD_REGISTRY_FRAMEWORKS = 'LOAD_REGISTRY_FRAMEWORKS';
export const LOAD_PLATFORM_DATA = 'LOAD_PLATFORM_DATA';
export const LOAD_FRAMEWORK_DATA = 'LOAD_FRAMEWORK_DATA';
export const LOAD_INSTALLED_PLATFORMS = 'LOAD_INSTALLED_PLATFORMS';
export const LOAD_PLATFORM_UPDATES = 'LOAD_PLATFORM_UPDATES';

export const INSTALL_PLATFORM = 'INSTALL_PLATFORM';
export const UNINSTALL_PLATFORM = 'UNINSTALL_PLATFORM';
export const UPDATE_PLATFORM = 'UPDATE_PLATFORM';

export const loadBoards = () => createAction(LOAD_BOARDS);
export const loadRegistryPlatforms = () => createAction(LOAD_REGISTRY_PLATFORMS);
export const loadRegistryFrameworks = () => createAction(LOAD_REGISTRY_FRAMEWORKS);
export const loadPlatformData = (name) => createAction(LOAD_PLATFORM_DATA, { name });
export const loadFrameworkData = (name) => createAction(LOAD_FRAMEWORK_DATA, { name });
export const loadInstalledPlatforms = () => createAction(LOAD_INSTALLED_PLATFORMS);
export const loadPlatformUpdates = () => createAction(LOAD_PLATFORM_UPDATES);

export const installPlatform = (platform, onEnd = undefined) =>
  createAction(INSTALL_PLATFORM, { platform, onEnd });
export const uninstallPlatform = (pkgDir, onEnd = undefined) =>
  createAction(UNINSTALL_PLATFORM, { pkgDir, onEnd });
export const updatePlatform = (pkgDir, onEnd = undefined) =>
  createAction(UPDATE_PLATFORM, { pkgDir, onEnd });
