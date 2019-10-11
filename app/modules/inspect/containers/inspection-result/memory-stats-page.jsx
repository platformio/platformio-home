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

import { Card, Col, Row, Spin, Statistic } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

import { connect } from 'react-redux';
import { goTo } from '@core/helpers';
import { selectSizeStats } from '@inspect/selectors';

class MemoryStatisticsPage extends React.PureComponent {
  static propTypes = {
    stats: PropTypes.shape({
      filesCount: PropTypes.number.isRequired,
      symbolsCount: PropTypes.number.isRequired,
      sectionsCount: PropTypes.number.isRequired,
      pioCheck: PropTypes.number
    }),
    onFileClick: PropTypes.func,
    onSectionClick: PropTypes.func,
    onSymbolClick: PropTypes.func
  };

  handleFileClick = () => {
    this.props.onFileClick();
  };
  handleSymbolClick = () => {
    this.props.onSymbolClick();
  };
  handleSectionClick = () => {
    this.props.onSectionClick();
  };

  renderLoader() {
    return (
      <div className="text-center">
        <Spin tip="Loading..." size="large" />
      </div>
    );
  }

  render() {
    const { stats } = this.props;
    if (!stats) {
      return this.renderLoader();
    }

    const { filesCount, symbolsCount, sectionsCount, pioCheck } = stats;
    return (
      <div>
        <h1>Inspection Statistics</h1>
        <Row gutter={16}>
          <Col span={4}>
            <Card hoverable onClick={this.handleFileClick}>
              <Statistic title="Number of Files" value={filesCount} precision={0} />
            </Card>
          </Col>
          <Col span={4}>
            <Card hoverable onClick={this.handleSymbolClick}>
              <Statistic title="Number of Symbols" value={symbolsCount} precision={0} />
            </Card>
          </Col>
          <Col span={4}>
            <Card hoverable onClick={this.handleSectionClick}>
              <Statistic
                title="Number of Sections"
                value={sectionsCount}
                precision={0}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state, { history }) {
  return {
    stats: selectSizeStats(state),
    onFileClick: () => goTo(history, '/inspect/result/files'),
    onSectionClick: () => goTo(history, '/inspect/result/sections'),
    onSymbolClick: () => goTo(history, '/inspect/result/symbols')
  };
}

export default connect(mapStateToProps)(MemoryStatisticsPage);
