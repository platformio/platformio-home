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

import FileExplorerPage from './memory-explorer-page';
import MemoryStatisticsPage from './memory-stats-page';
import SectionsExplorerPage from './memory-sections-page';
import SymbolsExplorerPage from './memory-symbols-page';

const routes = [
  {
    path: '/inspect/result/stats',
    icon: 'line-chart',
    label: 'Statistics',
    component: MemoryStatisticsPage
  },
  {
    path: '/inspect/result/files',
    icon: 'cluster',
    label: 'File Explorer',
    component: FileExplorerPage
  },
  {
    path: '/inspect/result/symbols',
    icon: 'tags',
    label: 'Symbols Explorer',
    component: SymbolsExplorerPage
  },
  {
    path: '/inspect/result/sections',
    icon: 'database',
    label: 'Sections Explorer',
    component: SectionsExplorerPage
  }
];

export default routes;
