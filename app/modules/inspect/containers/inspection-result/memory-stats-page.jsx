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

import { Card, Col, Icon, Progress, Row, Spin, Statistic } from 'antd';
import {
  CodeDefectsExplorer,
  DefectsType
} from '@inspect/components/code-defects-explorer';
import { SYMBOL_ICON_BY_TYPE, SYMBOL_NAME_BY_TYPE } from '@inspect/constants';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { formatSize } from '@inspect/helpers';
import { goTo } from '@core/helpers';
import { selectSizeStats } from '@inspect/selectors';

class MemoryStatisticsPage extends React.PureComponent {
  static propTypes = {
    stats: PropTypes.shape({
      filesCount: PropTypes.number.isRequired,
      symbolsCount: PropTypes.number.isRequired,
      sectionsCount: PropTypes.number.isRequired,
      pioCheck: PropTypes.number,
      ram: PropTypes.number.isRequired,
      flash: PropTypes.number.isRequired,
      topFiles: PropTypes.arrayOf(
        PropTypes.shape({
          path: PropTypes.string.isRequired,
          flash: PropTypes.number.isRequired
        })
      ).isRequired,
      topSymbols: PropTypes.arrayOf(
        PropTypes.shape({
          displayName: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          size: PropTypes.number.isRequired
        })
      ).isRequired,
      defectsCountTotal: PropTypes.number,
      defectsCountBySeverity: PropTypes.shape({
        low: PropTypes.number,
        medium: PropTypes.number,
        high: PropTypes.number
      }),
      topDefects: DefectsType
    }),
    onFileClick: PropTypes.func,
    onSectionClick: PropTypes.func,
    onSymbolClick: PropTypes.func
  };

  formatSize = value => {
    return value.toFixed(0) + '%';
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

  renderGauges() {
    const { ram, flash, defectsCountBySeverity, defectsCountTotal } = this.props.stats;
    const totalSize = ram + flash;
    return (
      <Row gutter={16} className="block text-center">
        <Col xs={12} sm={8} lg={4}>
          <Progress
            type="dashboard"
            format={this.formatSize}
            percent={(ram / totalSize) * 100}
            width={120}
            strokeColor="#1890ff"
          />
          <h4>RAM</h4>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Progress
            type="dashboard"
            format={this.formatSize}
            percent={(flash / totalSize) * 100}
            width={120}
            strokeColor="#faad14" // #52c41a
          />
          <h4>Flash</h4>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Progress
            type="dashboard"
            format={this.formatSize}
            percent={
              (defectsCountBySeverity.medium + defectsCountBySeverity.high) /
              defectsCountTotal
            }
            width={120}
            // successPercent={30}
            strokeColor={{
              '100%': '#52c41a', //'#108ee9',
              '70%': '#fadb14',
              '0%': '#f5222d'
            }}
          />
          <h4>Defects</h4>
        </Col>
      </Row>
    );
  }

  renderTiles() {
    const { filesCount, symbolsCount, sectionsCount } = this.props.stats;
    return (
      <Row gutter={16} className="block text-center">
        <Col xs={8} lg={4}>
          <Card hoverable onClick={this.handleFileClick}>
            <Statistic title="Files" value={filesCount} precision={0} />
          </Card>
        </Col>
        <Col xs={8} lg={4}>
          <Card hoverable onClick={this.handleSymbolClick}>
            <Statistic title="Symbols" value={symbolsCount} precision={0} />
          </Card>
        </Col>
        <Col xs={8} lg={4}>
          <Card hoverable onClick={this.handleSectionClick}>
            <Statistic title="Sections" value={sectionsCount} precision={0} />
          </Card>
        </Col>
      </Row>
    );
  }

  renderTopFiles() {
    return (
      <Card title="Top 5 Files" className="block">
        {this.props.stats.topFiles.map(file => (
          <Row gutter={16} key={file.path} className="inspect__top-block__row">
            <Col lg={3} md={4} sm={6} xs={8} className="text-right">
              {formatSize(file.flash)}
            </Col>
            <Col
              lg={21}
              md={20}
              sm={18}
              xs={16}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              {file.path}
            </Col>
          </Row>
        ))}
      </Card>
    );
  }

  renderTopSymbols() {
    return (
      <Card title="Top 5 Symbols" className="block">
        {this.props.stats.topSymbols.map(symbol => (
          <Row gutter={16} key={symbol.displayName} className="inspect__top-block__row">
            <Col lg={3} md={4} sm={6} xs={8} className="text-right">
              {formatSize(symbol.size)}
            </Col>
            <Col
              lg={21}
              md={20}
              sm={18}
              xs={16}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <Icon
                title={SYMBOL_NAME_BY_TYPE[symbol.type]}
                type={SYMBOL_ICON_BY_TYPE[symbol.type]}
              />{' '}
              {symbol.displayName}
            </Col>
          </Row>
        ))}
      </Card>
    );
  }

  renderTopDefects() {
    return (
      <Card title="Top 5 Defects" className="block">
        {this.props.stats.topDefects.map(
          ({ severity, message, line, column, category, id }, i) => (
            <Row gutter={16} key={i} className="inspect__top-block__row">
              <Col lg={4} md={6} sm={8} xs={24} className="text-right">
                {category}/{id}
              </Col>
              <Col
                lg={20}
                md={18}
                sm={16}
                xs={24}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                {CodeDefectsExplorer.renderSeverityIcon(severity)} [{line}:{column}]{' '}
                {message}
              </Col>
            </Row>
          )
        )}
      </Card>
    );
  }

  render() {
    const { stats } = this.props;
    if (!stats) {
      return this.renderLoader();
    }

    return (
      <div>
        <h2>Memory Inspection</h2>
        {this.renderGauges()}
        {this.renderTiles()}
        {this.renderTopFiles()}
        {this.renderTopSymbols()}

        <h2>Code Inspection</h2>
        {this.renderTopDefects()}
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
