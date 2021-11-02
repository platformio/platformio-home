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

import CodePage from '@inspect/containers/code';
import FileExplorerPage from '@inspect/containers/mem-explorer';
import SectionsPage from '@inspect/containers/mem-sections';
import StatisticsPage from '@inspect/containers/stats-page';
import SymbolsPage from '@inspect/containers/mem-symbols';

const common = [
  {
    path: '/inspect/result',
    icon: 'line-chart',
    label: 'Statistics',
    component: StatisticsPage,
  },
];

const memory = [
  {
    path: '/inspect/result/files',
    icon: 'cluster',
    label: 'Explorer',
    component: FileExplorerPage,
  },
  {
    path: '/inspect/result/symbols',
    icon: 'tags',
    label: 'Symbols',
    component: SymbolsPage,
  },
  {
    path: '/inspect/result/sections',
    icon: 'database',
    label: 'Sections',
    component: SectionsPage,
  },
];

const code = [
  {
    path: '/inspect/result/defects',
    icon: 'bug',
    label: 'Defects',
    component: CodePage,
  },
];

export default {
  common,
  memory,
  code,
};
