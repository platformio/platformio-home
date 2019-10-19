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

import { CONFIG_KEY, RESULT_KEY } from '@inspect/constants';
import { fixPath, shallowCompare } from '@inspect/helpers';
import { selectEntity, selectStorageItem } from '@store/selectors';

export function selectSavedConfiguration(state) {
  return selectStorageItem(state, CONFIG_KEY);
}

export function selectIsConfigurationDifferent(state, newConfiguration) {
  return !shallowCompare(newConfiguration, selectSavedConfiguration(state));
}

export function selectInspectionResult(state) {
  return selectEntity(state, RESULT_KEY);
}

export function selectCodeCheckResult(state) {
  const data = selectInspectionResult(state) || {};
  return data.codeCheck;
}

export function selectCodeCheckDefects(state) {
  const codeCheck = selectCodeCheckResult(state) || {};
  if (!codeCheck.defects) {
    return;
  }
  return codeCheck.defects.map(
    ({ category, column, file, id, line, message, severity }) => ({
      category,
      column: parseInt(column, 10),
      file,
      id,
      line: parseInt(line, 10),
      message,
      severity,
      tool: codeCheck.tool
    })
  );
}

export function selectExplorerSizeData(state) {
  const data = selectInspectionResult(state) || {};
  let files = (data.memory || {}).files;
  if (!files) {
    return;
  }

  if (!files.length) {
    // Autofix Object format into Array
    files = Object.entries(files).map(([k, v]) => ({
      ...v,
      path: k
    }));
  }
  return files.map(v => ({
    flash: v.flash_size,
    isDir: false,
    path: fixPath(v.path),
    ram: v.ram_size,
    symbols: (v.symbols || []).map(s => ({
      ...s,
      displayName: s.demangled_name !== undefined ? s.demangled_name : s.name
    }))
  }));
}

export function selectSymbolsSizeData(state) {
  const files = selectExplorerSizeData(state);
  if (!files) {
    return;
  }
  return files
    .map(({ symbols }) => symbols)
    .filter(x => x && x.length)
    .flat();
}

export function selectMemoryStats(state) {
  const memory = (selectInspectionResult(state) || {}).memory;
  if (!memory) {
    return;
  }
  const {
    files = [],
    total: { ram_size: ram, flash_size: flash, sections = [] } = {}
  } = memory;
  const allSymbols = selectSymbolsSizeData(state);

  return {
    ram,
    flash,
    filesCount: files.length,
    symbolsCount: files.reduce((total, { symbols = [] }) => total + symbols.length, 0),
    sectionsCount: Object.keys(sections).length,
    topSymbols: allSymbols
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .map(({ displayName, size, type }) => ({ displayName, size, type })),
    topFiles: files
      .map(({ flash_size, path }) => ({ flash: flash_size, path }))
      .sort((a, b) => b.flash - a.flash)
      .slice(0, 5)
  };
}

export function selectCodeStats(state) {
  const defects = selectCodeCheckDefects(state) || [];
  const codeCheck = selectCodeCheckResult(state) || {};

  return {
    defectsCountTotal: defects.length,
    defectsCountBySeverity: {
      low: defects.filter(({ severity }) => severity === 'low').length,
      medium: defects.filter(({ severity }) => severity === 'medium').length,
      high: defects.filter(({ severity }) => severity === 'high').length
    },
    stats: (codeCheck.stats || [])
      .map(obj =>
        Object.entries(obj).map(([component, { high = 0, medium = 0, low = 0 }]) => ({
          component,
          high,
          medium,
          low
        }))
      )
      .flat()
      .sort((a, b) => a.component.localeCompare(b.component))
  };
}
