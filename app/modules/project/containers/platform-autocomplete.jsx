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

import { OptionAutocomplete } from '@project/components/option-autocomplete';
import { OptionEditorFactory } from '@project/helpers';
import React from 'react';
import { connect } from 'react-redux';
import { loadRegistryPlatforms } from '@platform/actions';
import { selectRegistryPlatforms } from '@platform/selectors';

function mapStateToProps(state) {
  const rawItems = selectRegistryPlatforms(state);
  let items;
  if (rawItems) {
    items = rawItems.map((platform) => ({
      name: `${platform.title} (${platform.name})`,
      value: platform.name,
    }));
  }
  return {
    items,
  };
}

const dispatchToProps = {
  onLoad: () => loadRegistryPlatforms(true),
};

export const PlatformAutocomplete = connect(
  mapStateToProps,
  dispatchToProps
)(OptionAutocomplete);
PlatformAutocomplete.displayName = 'PlatformAutocomplete';

OptionEditorFactory.register(
  (schema) => schema && schema.name.endsWith('platform'),
  (_schema, inputProps) => <PlatformAutocomplete {...inputProps} />
);
