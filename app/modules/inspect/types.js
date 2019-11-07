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

import PropTypes from 'prop-types';

export const ConfigurationType = PropTypes.shape({
  code: PropTypes.bool,
  env: PropTypes.string.isRequired,
  memory: PropTypes.bool,
  projectDir: PropTypes.string.isRequired
});

export const DefectType = PropTypes.shape({
  category: PropTypes.string.isRequired,
  column: PropTypes.number.isRequired,
  file: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  line: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.string.isRequired,
  tool: PropTypes.string.isRequired
});

export const SymbolType = PropTypes.shape({
  addr: PropTypes.number.isRequired,
  bind: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  demangled_name: PropTypes.string,
  name: PropTypes.string.isRequired,
  section: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  file: PropTypes.string,
  line: PropTypes.number
});

export const SectionsType = PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string,
    flags: PropTypes.string,
    size: PropTypes.number,
    startAddr: PropTypes.number,
    type: PropTypes.string
  })
);

export const DeviceType = PropTypes.shape({
  cpu: PropTypes.string,
  flash: PropTypes.number,
  frequency: PropTypes.number,
  mcu: PropTypes.string,
  ram: PropTypes.number
});
