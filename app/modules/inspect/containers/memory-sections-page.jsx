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
  MemorySectionsExplorer,
  SectionsType
} from '@inspect/components/memory-sections-explorer.jsx';

import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { requestContent } from '@core/actions';
import { selectSectionsSizeData } from '@inspect/selectors';

// FIXME: load dynamically via API
export const JSON_URL = 'http://dl.platformio.org/tmp/sizedata-tasmota.json';

class SectionsExplorerPage extends React.PureComponent {
  static propTypes = {
    requestContent: PropTypes.func.isRequired,
    sections: SectionsType
  };

  constructor(...args) {
    super(...args);

    this.state = {};

    this.props.requestContent({
      uri: JSON_URL
    });
  }

  render() {
    const { sections } = this.props;

    return (
      <div className="page-container">
        {!sections && (
          <div className="text-center">
            <Spin tip="Loading..." size="large" />
          </div>
        )}
        {sections && <MemorySectionsExplorer sections={sections} />}
      </div>
    );
  }
}

// Redux
function mapStateToProps(state) {
  return {
    sections: selectSectionsSizeData(state)
  };
}

export default connect(
  mapStateToProps,
  { requestContent }
)(SectionsExplorerPage);
