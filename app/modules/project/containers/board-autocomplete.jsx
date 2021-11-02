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
import { loadBoards } from '@platform/actions';
import { selectBoards } from '@platform/selectors';

function mapStateToProps(state, ownProps) {
  const rawItems = selectBoards(state);
  let items;
  if (rawItems) {
    const sectionData = ownProps.configSectionData || [];
    const platform = getConfigOptionValue(sectionData, 'platform');
    const frameworks = getConfigOptionValue(sectionData, 'framework') || [];

    items = rawItems
      .filter(
        (board) =>
          (!platform || !board.platform || board.platform === platform) &&
          (!frameworks.length ||
            frameworks.some((framework) => board.frameworks.includes(framework)))
      )
      .map((board) => ({
        name: `${board.name} (${board.id})`,
        value: board.id,
      }));
  }
  return {
    items,
  };
}

const dispatchToProps = {
  onLoad: () => loadBoards(true),
};

export const BoardAutocomplete = connect(
  mapStateToProps,
  dispatchToProps
)(OptionAutocomplete);
BoardAutocomplete.displayName = 'BoardAutocomplete';

OptionEditorFactory.register(
  (schema) => schema && schema.name.endsWith('board'),
  (_schema, inputProps) => <BoardAutocomplete {...inputProps} />
);
