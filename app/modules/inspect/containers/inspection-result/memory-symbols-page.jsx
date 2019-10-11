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
  MemorySymbolsExplorer,
  SymbolType
} from '@inspect/components/memory-symbols-explorer.jsx';

import PropTypes from 'prop-types';
import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import { selectSymbolsSizeData } from '@inspect/selectors';

class SymbolsExplorerPage extends React.PureComponent {
  static propTypes = {
    symbols: PropTypes.arrayOf(SymbolType)
  };

  render() {
    const { symbols } = this.props;

    return (
      <div className="page-container">
        {!symbols && (
          <div className="text-center">
            <Spin tip="Loading..." size="large" />
          </div>
        )}
        {symbols && <MemorySymbolsExplorer symbols={symbols} />}
      </div>
    );
  }
}

// Redux
function mapStateToProps(state) {
  return {
    symbols: selectSymbolsSizeData(state)
  };
}

export default connect(mapStateToProps)(SymbolsExplorerPage);
