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
import { SYMBOL_ICON_BY_TYPE, SYMBOL_NAME_BY_TYPE } from '@inspect/constants';
import { selectCodeStats, selectMemoryStats } from '@inspect/selectors';

import { DefectType } from '@inspect/types';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { formatSize } from '@inspect/helpers';
import { goTo } from '@core/helpers';

class MemoryStatisticsPage extends React.PureComponent {
  static propTypes = {
    memory: PropTypes.shape({
      filesCount: PropTypes.number.isRequired,
      symbolsCount: PropTypes.number.isRequired,
      sectionsCount: PropTypes.number.isRequired,
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
      ).isRequired
    }),
    code: PropTypes.shape({
      defectsCountTotal: PropTypes.number,
      defectsCountBySeverity: PropTypes.shape({
        low: PropTypes.number,
        medium: PropTypes.number,
        high: PropTypes.number
      }),
      topDefects: PropTypes.arrayOf(DefectType)
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
    const totalSize = this.props.memory
      ? this.props.memory.ram + this.props.memory.flash
      : 0;

    return (
      <Row gutter={16} className="block text-center">
        {this.props.memory && (
          <Col xs={12} sm={8} lg={4}>
            <Progress
              type="dashboard"
              format={this.formatSize}
              percent={(this.props.memory.ram / totalSize) * 100}
              width={120}
              strokeColor="#1890ff"
            />
            <h4>RAM</h4>
          </Col>
        )}
        {this.props.memory && (
          <Col xs={12} sm={8} lg={4}>
            <Progress
              type="dashboard"
              format={this.formatSize}
              percent={(this.props.memory.flash / totalSize) * 100}
              width={120}
              strokeColor="#faad14" // #52c41a
            />
            <h4>Flash</h4>
          </Col>
        )}
        {this.props.code && (
          <Col xs={12} sm={8} lg={4}>
            <Progress
              type="dashboard"
              format={this.formatSize}
              percent={
                (this.props.code.defectsCountBySeverity.medium +
                  this.props.code.defectsCountBySeverity.high) /
                this.props.code.defectsCountTotal
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
        )}
      </Row>
    );
  }

  renderTiles() {
    if (!this.props.memory) {
      return;
    }
    const { filesCount, symbolsCount, sectionsCount } = this.props.memory;
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
        <table className="inspect__top-block__table">
          <tbody>
            {this.props.memory.topFiles.map(({ flash, path }) => (
              <tr key={path}>
                <td className="inspect__top-block__cell text-right inspect__top-block__cell_size">
                  {formatSize(flash)}
                </td>
                <td
                  className="inspect__top-block__cell "
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  {path}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  }

  renderTopSymbols() {
    return (
      <Card title="Top 5 Symbols" className="block">
        <table className="inspect__top-block__table">
          <tbody>
            {this.props.memory.topSymbols.map(symbol => (
              <tr key={symbol.displayName}>
                <td className="inspect__top-block__cell text-right inspect__top-block__cell_size">
                  {formatSize(symbol.size)}{' '}
                </td>
                <td className="inspect__top-block__cell ">
                  <Icon
                    title={SYMBOL_NAME_BY_TYPE[symbol.type]}
                    type={SYMBOL_ICON_BY_TYPE[symbol.type]}
                  />{' '}
                  {symbol.displayName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  }

  renderTopDefects() {
    return (
      <Card title="Top 5 Defects" className="block">
        <table className="inspect__top-block__table">
          <tbody>
            {this.props.code.topDefects.map(
              ({ severity, message, line, column, category, id }, i) => (
                <tr key={i}>
                  <td className="inspect__top-block__cell">
                    {category}/{id}
                  </td>
                  <td className="inspect__top-block__cell ">
                    {severity} [{line}:{column}] {message}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </Card>
    );
  }

  render() {
    if (!(this.props.memory || this.props.code)) {
      return this.renderLoader();
    }
    return (
      <div>
        {
          <div>
            {this.renderGauges()}
            {this.props.memory && this.renderTiles()}
            {this.props.memory && this.renderTopFiles()}
            {this.props.memory && this.renderTopSymbols()}
          </div>
        }
        {this.props.code && <div>{this.renderTopDefects()}</div>}
      </div>
    );
  }
}

function mapStateToProps(state, { history }) {
  return {
    code: selectCodeStats(state),
    memory: selectMemoryStats(state),
    onFileClick: () => goTo(history, '/inspect/result/files'),
    onSectionClick: () => goTo(history, '/inspect/result/sections'),
    onSymbolClick: () => goTo(history, '/inspect/result/symbols')
  };
}

export default connect(mapStateToProps)(MemoryStatisticsPage);
