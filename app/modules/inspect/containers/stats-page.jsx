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

import { Card, Col, Icon, Progress, Row, Spin, Statistic, Table, Tooltip } from 'antd';
import { SYMBOL_ICON_BY_TYPE, SYMBOL_NAME_BY_TYPE } from '@inspect/constants';
import { selectCodeStats, selectMemoryStats } from '@inspect/selectors';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { formatSize } from '@inspect/helpers';
import { goTo } from '@core/helpers';

class MemoryStatisticsPage extends React.PureComponent {
  static propTypes = {
    // data
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
      stats: PropTypes.arrayOf(
        PropTypes.shape({
          component: PropTypes.string.isRequired,
          high: PropTypes.number.isRequired,
          medium: PropTypes.number.isRequired,
          low: PropTypes.number.isRequired
        })
      )
    }),
    // callbacks
    onFileClick: PropTypes.func,
    onSectionClick: PropTypes.func,
    onSymbolClick: PropTypes.func
  };

  static formatPercent(value) {
    return value.toFixed(0) + '%';
  }

  formatDefects() {
    return this.props.code.defectsCountTotal;
  }

  getDefectsTooltip() {
    return [
      `${this.props.code.defectsCountBySeverity.high} High`,
      `${this.props.code.defectsCountBySeverity.medium} Medium`,
      `${this.props.code.defectsCountBySeverity.low} Low`
    ].join(' / ');
  }

  getDefectsCls() {
    const { high, medium } = this.props.code.defectsCountBySeverity;
    if (high) {
      return 'progress-error-stroke';
    }
    if (medium) {
      return 'progress-warning-stroke';
    }
  }

  getGaugeCls(percent) {
    if (percent >= 75) {
      return 'progress-error-stroke';
    }
    if (percent > 50) {
      return 'progress-warning-stroke';
    }
  }

  handleFileClick() {
    this.props.onFileClick();
  }
  handleSymbolClick() {
    this.props.onSymbolClick();
  }
  handleSectionClick() {
    this.props.onSectionClick();
  }

  renderLoader() {
    return (
      <div className="text-center">
        <Spin tip="Loading..." size="large" />
      </div>
    );
  }

  renderGauges() {
    let totalSize;
    let ramPercent;
    let flashPercent;

    if (this.props.memory) {
      totalSize = this.props.memory.ram + this.props.memory.flash;
      ramPercent = (this.props.memory.ram / totalSize) * 100;
      flashPercent = (this.props.memory.flash / totalSize) * 100;
    }

    return (
      <Row gutter={16} className="block text-center">
        {ramPercent !== undefined && (
          <Col xs={12} sm={8} lg={4} className={this.getGaugeCls(ramPercent)}>
            <Tooltip
              title={`${formatSize(this.props.memory.ram)} of ${formatSize(totalSize)}`}
            >
              <Progress
                type="dashboard"
                format={MemoryStatisticsPage.formatPercent}
                percent={ramPercent}
                width={120}
                strokeColor="#1890ff"
              />
            </Tooltip>
            <h4>RAM</h4>
          </Col>
        )}
        {flashPercent !== undefined && (
          <Col xs={12} sm={8} lg={4} className={this.getGaugeCls(flashPercent)}>
            <Tooltip
              title={`${formatSize(this.props.memory.flash)} of ${formatSize(
                totalSize
              )}`}
            >
              <Progress
                type="dashboard"
                format={MemoryStatisticsPage.formatPercent}
                percent={flashPercent}
                width={120}
                strokeColor="#faad14" // #52c41a
              />
            </Tooltip>
            <h4>Flash</h4>
          </Col>
        )}
        {this.props.code && (
          <Col xs={12} sm={8} lg={4} className={this.getDefectsCls()}>
            <Tooltip title={this.getDefectsTooltip()}>
              <Progress
                type="dashboard"
                format={::this.formatDefects}
                percent={100}
                successPercent={0}
                width={120}
              />
            </Tooltip>
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
          <Card hoverable onClick={::this.handleFileClick}>
            <Statistic title="Files" value={filesCount} precision={0} />
          </Card>
        </Col>
        <Col xs={8} lg={4}>
          <Card hoverable onClick={::this.handleSymbolClick}>
            <Statistic title="Symbols" value={symbolsCount} precision={0} />
          </Card>
        </Col>
        <Col xs={8} lg={4}>
          <Card hoverable onClick={::this.handleSectionClick}>
            <Statistic title="Sections" value={sectionsCount} precision={0} />
          </Card>
        </Col>
      </Row>
    );
  }

  renderTopFiles() {
    return (
      <Card title="Top 5 Files" className="block ">
        <table className="inspect-stats-block">
          <tbody>
            {this.props.memory.topFiles.map(({ flash, path }) => (
              <tr key={path}>
                <td className="text-right">
                  <b>{formatSize(flash)}</b>
                </td>
                <td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>{path}</td>
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
        <table className="inspect-stats-block">
          <tbody>
            {this.props.memory.topSymbols.map(symbol => (
              <tr key={symbol.displayName}>
                <td className="text-right">
                  <b>{formatSize(symbol.size)}</b>
                </td>
                <td>
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
    const columns = [
      {
        title: 'Component',
        dataIndex: 'component'
      },
      {
        align: 'right',
        title: 'High',
        dataIndex: 'high'
      },
      {
        align: 'right',
        title: 'Medium',
        dataIndex: 'medium'
      },
      {
        align: 'right',
        title: 'Low',
        dataIndex: 'low'
      }
    ];
    return (
      this.props.code.stats.length !== 0 && (
        <Table
          title={() => 'Defects Summary'}
          columns={columns}
          dataSource={this.props.code.stats}
          pagination={false}
          size="small"
        />
      )
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
