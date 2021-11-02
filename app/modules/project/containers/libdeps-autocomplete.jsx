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

import { MODE_TAGS, OptionAutocomplete } from '@project/components/option-autocomplete';
import { OptionEditorFactory, getConfigOptionValue } from '@project/helpers';

import React from 'react';
import { connect } from 'react-redux';
import { loadSearchResult } from '@library/actions';
import { selectSearchResult } from '@library/selectors';

function getFullQuery(query, ownProps) {
  const sectionData = ownProps.configSectionData || [];
  const frameworks = getConfigOptionValue(sectionData, 'framework') || [];
  const q = [
    query,
    ...frameworks.map((f) => `framework:"${f.replace(/"/g, '&quot;')}"`),
  ];
  return q.join(' ');
}

function mapStateToProps(state, ownProps) {
  let items;
  const searchResult = selectSearchResult(
    state,
    getFullQuery(ownProps.query, ownProps)
  );
  if (searchResult) {
    items = searchResult.items.map((s) => ({
      data: s,
      key: s.id,
      name: `${s.ownername}/${s.name}`,
      value: `${s.ownername}/${s.name} @ ^${s.versionname}`,
    }));
  }
  return { items };
}

function dispatchToProps(dispatch, ownProps) {
  return {
    onLoad: (options, onEnd) => {
      dispatch(loadSearchResult(getFullQuery(options.query, ownProps), 1, onEnd));
    },
  };
}

export const LibDepsAutocompleteInner = connect(
  mapStateToProps,
  dispatchToProps
)(OptionAutocomplete);
LibDepsAutocompleteInner.displayName = 'LibDepsAutocompleteInner';

class LibDepsAutocomplete extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  handleSearch = (query) => {
    this.setState({ query });
  };

  render() {
    return (
      <LibDepsAutocompleteInner
        {...this.props}
        query={this.state.query}
        onSearch={this.handleSearch}
      />
    );
  }
}

OptionEditorFactory.register(
  (schema) => schema && schema.name === 'lib_deps',
  (_schema, inputProps, _itemProps, decoratorOptions) => {
    decoratorOptions.trigger = 'onChange';
    return (
      <LibDepsAutocomplete
        {...inputProps}
        mode={MODE_TAGS}
        remoteFilter
        addText="Add Library"
        addPlaceholder="Search library"
      />
    );
  }
);
