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

import { OptionEditorFactory, getConfigOptionValue } from '@project/helpers';

import { OptionAutocomplete } from '@project/components/option-autocomplete';
import React from 'react';
import { connect } from 'react-redux';
import { loadRegistryFrameworks } from '@platform/actions';
import { selectRegistryFrameworks } from '@platform/selectors';

function mapStateToProps(state, ownProps) {
  const rawItems = selectRegistryFrameworks(state);
  let items;
  if (rawItems) {
    const sectionData = ownProps.configSectionData || [];
    const platform = getConfigOptionValue(sectionData, 'platform');

    items = rawItems.filter(
      framework =>
        !platform ||
        !framework.platforms ||
        !framework.platforms.length ||
        framework.platforms.includes(platform)
    );
    if (!items.length) {
      // If there are no filtered results - display without filter
      items = rawItems;
    }
    items = items.map(framework => ({ name: framework.title, value: framework.name }));
  }
  return {
    items
  };
}

const dispatchToProps = {
  onLoad: () => loadRegistryFrameworks(true)
};

export const FrameworkAutocomplete = connect(
  mapStateToProps,
  dispatchToProps
)(OptionAutocomplete);
FrameworkAutocomplete.displayName = 'FrameworkAutocomplete';

OptionEditorFactory.register(
  schema => schema && schema.name.endsWith('framework'),
  (schema, inputProps) => (
    <FrameworkAutocomplete {...inputProps} multiple={schema && schema.multiple} />
  )
);
