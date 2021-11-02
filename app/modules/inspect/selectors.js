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

import {
  CONFIG_KEY,
  METRICS_KEY,
  RESULT_KEY,
  SEVERITY_LEVEL,
  STORAGE_KEY,
} from '@inspect/constants';
import {
  arrayFlat,
  resolveRelativePathSegments,
  shallowCompare,
  windowsToPosixPath,
} from '@inspect/helpers';
import { selectEntity, selectStorageItem } from '@store/selectors';

export function selectInspectStorage(state, namespace) {
  const root = selectStorageItem(state, STORAGE_KEY) || {};
  return namespace ? root[namespace] : root;
}

export function selectMetrics(state) {
  return selectInspectStorage(state, METRICS_KEY) || {};
}

export function selectMetric(state, name, projectDir, env) {
  const key = [projectDir, env, name].join(':');
  return selectMetrics(state)[key];
}

export function selectSavedConfiguration(state) {
  return selectInspectStorage(state, CONFIG_KEY);
}

export function selectIsConfigurationDifferent(state, newConfiguration) {
  return !shallowCompare(newConfiguration, selectSavedConfiguration(state));
}

export function selectInspectionResult(state) {
  return selectEntity(state, RESULT_KEY);
}

export function selectInspectionError(state) {
  return (selectEntity(state, RESULT_KEY) || {}).error;
}

export function selectMemoryInspectionResult(state) {
  const data = selectInspectionResult(state) || {};
  return data.memory;
}

export function selectCodeCheckResults(state) {
  const data = selectInspectionResult(state) || {};
  return data.codeChecks;
}

export function selectCodeCheckDefects(state) {
  const codeChecks = selectCodeCheckResults(state);
  if (!codeChecks) {
    return;
  }
  return arrayFlat(
    codeChecks.map(({ tool, defects }) => {
      return defects.map((item) => {
        item['tool'] = tool;
        item['level'] = SEVERITY_LEVEL[item.severity.toUpperCase()];
        return item;
      });
    })
  );
}

export function selectExplorerSizeData(state) {
  const data = selectMemoryInspectionResult(state) || {};
  let files = (data.memory || {}).files;
  if (!files) {
    return;
  }

  if (!files.length) {
    // Autofix Object format into Array
    files = Object.entries(files).map(([k, v]) => ({
      ...v,
      path: k,
    }));
  }
  return files.map((v) => ({
    flash: v.flash_size,
    isDir: false,
    path: resolveRelativePathSegments(windowsToPosixPath(v.path), '/'),
    ram: v.ram_size,
    symbols: (v.symbols || []).map((s) => ({
      ...s,
      displayName: s.demangled_name !== undefined ? s.demangled_name : s.name,
    })),
  }));
}

export function selectSymbolsSizeData(state) {
  const files = selectExplorerSizeData(state);
  if (!files) {
    return;
  }
  return arrayFlat(files.map(({ symbols }) => symbols).filter((x) => x && x.length));
}

export function selectMemoryStats(state) {
  const memory = (selectMemoryInspectionResult(state) || {}).memory;
  if (!memory) {
    return;
  }
  const files = selectExplorerSizeData(state);
  const allSymbols = selectSymbolsSizeData(state);
  const { total: { ram_size: ram, flash_size: flash, sections = [] } = {} } = memory;

  return {
    ram,
    flash,
    filesCount: files.length,
    symbolsCount: files.reduce((total, { symbols = [] }) => total + symbols.length, 0),
    sectionsCount: Object.keys(sections).length,
    topSymbols: allSymbols.sort((a, b) => b.size - a.size).slice(0, 5),
    topFiles: files.sort((a, b) => b.flash - a.flash).slice(0, 5),
  };
}

export function selectCodeStats(state) {
  const codeChecks = selectCodeCheckResults(state);
  if (!codeChecks || !codeChecks.length) {
    return;
  }
  const defects = selectCodeCheckDefects(state) || [];

  const statsByComponent = {};
  for (const codeCheck of codeChecks) {
    for (const [_name, cmpStats] of Object.entries(codeCheck.stats || {})) {
      const name = windowsToPosixPath(_name);
      if (!statsByComponent[name]) {
        statsByComponent[name] = {
          high: 0,
          medium: 0,
          low: 0,
        };
      }
      statsByComponent[name].low += cmpStats.low || 0;
      statsByComponent[name].medium += cmpStats.medium || 0;
      statsByComponent[name].high += cmpStats.high || 0;
    }
  }
  return {
    defectsCountTotal: defects.length,
    defectsCountBySeverity: {
      low: defects.filter(({ severity }) => severity === 'low').length,
      medium: defects.filter(({ severity }) => severity === 'medium').length,
      high: defects.filter(({ severity }) => severity === 'high').length,
    },
    stats: Object.entries(statsByComponent)
      .map(([component, stats]) => ({ ...stats, component }))
      .sort((a, b) => a.component.localeCompare(b.component)),

    topDefects: defects.sort((a, b) => a.level - b.level).slice(0, 5),
  };
}

export function selectSectionsSizeData(state) {
  const data = selectMemoryInspectionResult(state);
  let { memory: { total: { sections } = {} } = {} } = data || {};
  if (!sections) {
    return;
  }
  if (!sections.length) {
    sections = Object.entries(sections).map(([k, v]) => ({
      ...v,
      name: k,
    }));
  }
  return sections.map(({ flags, size, type, start_addr: startAddr, name }) => ({
    flags,
    size,
    type: type != undefined ? type.toString() : '',
    startAddr,
    name,
  }));
}

export function selectDeviceInfo(state) {
  const result = (selectMemoryInspectionResult(state) || {}).device;
  if (result) {
    if (result.frequency && typeof result.frequency !== 'number') {
      result.frequency = parseInt(result.frequency, 10);
    }
  }
  return result;
}
