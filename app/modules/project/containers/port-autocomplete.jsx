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
import { loadSerialPorts } from '@project/actions';
import { selectSerialPortsList } from '@project/selectors';

function mapStateToProps(state) {
  return {
    items: selectSerialPortsList(state)
  };
}

const dispatchToProps = {
  onLoad: loadSerialPorts
};

export const PortAutocomplete = connect(
  mapStateToProps,
  dispatchToProps
)(OptionAutocomplete);

OptionEditorFactory.register(
  schema => schema && schema.name.endsWith('_port'),
  (_schema, inputProps) => <PortAutocomplete {...inputProps} />
);
