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

import { INSPECTION_KEY } from '@inspect/constants';
import { fixPath } from '@inspect/helpers';

export function selectProjectInspectionMeta(state) {
  return (state.entities[INSPECTION_KEY] || {}).meta;
}

function selectProjectInspectionData(state) {
  return (state.entities[INSPECTION_KEY] || {}).data;
}

export function selectExplorerSizeData(state) {
  const data = selectProjectInspectionData(state) || {};
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

export function selectSectionsSizeData(state) {
  const data = selectProjectInspectionData(state);
  let { memory: { total: { sections } = {} } = {} } = data || {};
  if (!sections) {
    return;
  }
  if (!sections.length) {
    sections = Object.entries(sections).map(([k, v]) => ({
      ...v,
      name: k
    }));
  }
  return sections.map(({ flags, size, type, start_addr: startAddr, name }) => ({
    flags,
    size,
    type,
    startAddr,
    name
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

const levelsBySeverity = {
  high: 1,
  medium: 2,
  low: 3
};

export function selectSizeStats(state) {
  const data = selectProjectInspectionData(state);
  if (!data) {
    return;
  }
  const {
    codeCheck: { defects = [] } = {},
    memory: {
      files = [],
      total: { ram_size: ram, flash_size: flash, sections = [] } = {}
    } = {}
  } = data;

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
      .slice(0, 5),
    defectsCountTotal: defects.length,
    defectsCountBySeverity: {
      low: defects.filter(({ severity }) => severity === 'low').length,
      medium: defects.filter(({ severity }) => severity === 'medium').length,
      high: defects.filter(({ severity }) => severity === 'high').length
    },
    topDefects: defects
      .map(d => ({ ...d, level: levelsBySeverity[d.severity] }))
      .sort((a, b) => a.severity - b.severity)
      .slice(0, 5)
  };
}

export function selectCodeCheckData(state) {
  const data = selectProjectInspectionData(state) || {};
  if (!data.codeCheck || !data.codeCheck.defects) {
    return;
  }
  const { codeCheck } = data;
  return codeCheck.defects.map(
    ({ category, column, file, id, line, message, severity }) => ({
      category,
      column,
      file,
      id,
      line,
      message,
      severity,
      tool: codeCheck.tool
    })
  );
}
