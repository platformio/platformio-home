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

import { SCOPES, TYPES } from '@project/constants';

import PropTypes from 'prop-types';

export const ProjectType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  modified: PropTypes.number.isRequired,
  boards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  )
});

export const ActionType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  icon: PropTypes.string,
  text: PropTypes.string.isRequired
});

export const SchemaType = PropTypes.arrayOf(
  PropTypes.shape({
    default: PropTypes.any,
    description: PropTypes.string,
    group: PropTypes.string,
    max: PropTypes.number,
    min: PropTypes.number,
    name: PropTypes.string.isRequired,
    multiple: PropTypes.bool,
    scope: PropTypes.oneOf(SCOPES).isRequired,
    sysenvvar: PropTypes.string,
    type: PropTypes.oneOf(TYPES)
  })
);

export const ConfigOptionType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  value: PropTypes.any
});
