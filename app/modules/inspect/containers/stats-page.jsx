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

import { Card, Col, Icon, Progress, Row, Spin, Table, Tooltip } from 'antd';
import { DefectType, DeviceType } from '@inspect/types';
import { SYMBOL_ICON_BY_TYPE, SYMBOL_NAME_BY_TYPE } from '@inspect/constants';
import { formatSize, limitPathLength } from '@inspect/helpers';
import {
  selectCodeStats,
  selectDeviceInfo,
  selectMemoryStats
} from '@inspect/selectors';

import { CodeDefects } from '@inspect/components/code-defects';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
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
      ),
      topDefects: PropTypes.arrayOf(DefectType)
    }),
    device: DeviceType,
    // callbacks
    onMemoryClick: PropTypes.func.isRequired,
    onCodeClick: PropTypes.func.isRequired,
    onSymbolsClick: PropTypes.func.isRequired
  };

  formatMemoryProgress(percent, value) {
    return (
      <span>
        {percent.toFixed(0) + '%'}
        <div>
          <small>{formatSize(value)}</small>
        </div>
      </span>
    );
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
    if (percent >= 90) {
      return 'progress-error-stroke';
    }
    if (percent >= 75) {
      return 'progress-warning-stroke';
    }
  }

  handleMemoryClick() {
    this.props.onMemoryClick();
  }
  handleCodeClick() {
    this.props.onCodeClick();
  }

  handleSymbolsClick() {
    this.props.onSymbolsClick();
  }

  renderLoader() {
    return (
      <div className="text-center">
        <Spin tip="Loading..." size="large" />
      </div>
    );
  }

  renderDashboards() {
    let ramPercent;
    let flashPercent;

    if (this.props.memory && this.props.device) {
      ramPercent = (this.props.memory.ram / this.props.device.ram) * 100;
      flashPercent = (this.props.memory.flash / this.props.device.flash) * 100;
    }

    return (
      <Row gutter={16} className="block text-center inspect-dashboard">
        {ramPercent !== undefined && (
          <Col xs={12} sm={8} lg={4} className={this.getGaugeCls(ramPercent)}>
            <Tooltip
              title={`${formatSize(this.props.memory.ram)} of ${formatSize(
                this.props.device.ram
              )}`}
            >
              <Progress
                type="dashboard"
                format={percent =>
                  this.formatMemoryProgress(percent, this.props.memory.ram)
                }
                onClick={::this.handleMemoryClick}
                percent={ramPercent}
                width={120}
              />
            </Tooltip>
            <h4>RAM</h4>
          </Col>
        )}
        {flashPercent !== undefined && (
          <Col xs={12} sm={8} lg={4} className={this.getGaugeCls(flashPercent)}>
            <Tooltip
              title={`${formatSize(this.props.memory.flash)} of ${formatSize(
                this.props.device.flash
              )}`}
            >
              <Progress
                type="dashboard"
                format={percent =>
                  this.formatMemoryProgress(percent, this.props.memory.flash)
                }
                onClick={::this.handleMemoryClick}
                percent={flashPercent}
                width={120}
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
                format={() => this.props.code.defectsCountTotal}
                onClick={::this.handleCodeClick}
                percent={this.props.code.defectsCountTotal === 0 ? 0 : 100}
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

  renderTopFiles() {
    return (
      <Card title="Top 5 Files" className="block ">
        <table className="inspect-stats-block">
          <tbody>
            {this.props.memory.topFiles.map(({ flash, path }) => (
              <tr key={path} onClick={::this.handleMemoryClick}>
                <td className="text-right">
                  <b>{formatSize(flash)}</b>
                </td>
                <td>
                  <Tooltip title={path} overlayStyle={{ maxWidth: 400 }}>
                    {limitPathLength(path, 35)}
                  </Tooltip>
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
        <table className="inspect-stats-block">
          <tbody>
            {this.props.memory.topSymbols.map(symbol => (
              <tr key={symbol.displayName} onClick={::this.handleSymbolsClick}>
                <td className="text-right">
                  <b>{formatSize(symbol.size)}</b>
                </td>
                <td>
                  <div
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}
                  >
                    <Tooltip
                      title={`${symbol.type} -> ${
                        symbol.file ? `${symbol.file}:${symbol.line}` : 'unknown'
                      }`}
                      overlayStyle={{ maxWidth: 400 }}
                    >
                      <Icon
                        title={SYMBOL_NAME_BY_TYPE[symbol.type]}
                        type={SYMBOL_ICON_BY_TYPE[symbol.type]}
                      />{' '}
                      {symbol.displayName}
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  }

  renderDefectsStats() {
    if (!this.props.code.stats.length) {
      return;
    }
    const columns = [
      {
        title: 'Component',
        dataIndex: 'component',
        render: text => (
          <Tooltip title={text}>
            <b>{limitPathLength(text || '', 40)}</b>
          </Tooltip>
        )
      },
      {
        align: 'center',
        title: 'High',
        dataIndex: 'high'
      },
      {
        align: 'center',
        title: 'Medium',
        dataIndex: 'medium'
      },
      {
        align: 'center',
        title: 'Low',
        dataIndex: 'low'
      }
    ];

    const ds = [
      ...this.props.code.stats,
      { component: '\u00A0' },
      {
        component: 'Total',
        ...this.props.code.defectsCountBySeverity
      }
    ];

    return (
      <Card title="Defects Summary" className="block defects-stats-block">
        <Table
          className="inspect-stats-table"
          columns={columns}
          dataSource={ds}
          onRow={({ component }) => ({
            className: component === '\u00A0' ? 'empty-row' : '',
            onClick: ::this.handleCodeClick
          })}
          rowKey="component"
          pagination={false}
          size="small"
        />
      </Card>
    );
  }

  renderTopDefects() {
    if (!this.props.code.topDefects.length) {
      return;
    }
    const columns = [
      {
        title: 'Level',
        dataIndex: 'level',
        render: CodeDefects.renderSeverityLevel
      },
      {
        title: 'Message',
        dataIndex: 'message',
        render: (message, { file, line, column }) => (
          <Tooltip title={`${limitPathLength(file || '', 40)}:${line}:${column}`}>
            {message}
          </Tooltip>
        ),
        width: '100%'
      }
    ];
    return (
      <Card title="Top Defects" className="block defects-stats-block">
        <Table
          className="inspect-stats-table"
          columns={columns}
          dataSource={this.props.code.topDefects.map((x, idx) => ({ ...x, idx }))}
          onRow={() => ({ onClick: ::this.handleCodeClick })}
          rowKey="idx"
          pagination={false}
          size="small"
        />
      </Card>
    );
  }

  render() {
    if (!(this.props.memory || this.props.code)) {
      return this.renderLoader();
    }
    return (
      <div className="inspect-stats-page">
        {this.renderDashboards()}
        {this.props.memory && (
          <Row gutter={12}>
            <Col md={12}>{this.renderTopFiles()}</Col>
            <Col md={12}>{this.renderTopSymbols()}</Col>
          </Row>
        )}
        {this.props.code && (
          <Row gutter={12}>
            <Col md={12}>{this.renderDefectsStats()}</Col>
            <Col md={12}>{this.renderTopDefects()}</Col>
          </Row>
        )}
      </div>
    );
  }
}

function mapStateToProps(state, { history }) {
  return {
    code: selectCodeStats(state),
    device: selectDeviceInfo(state),
    memory: selectMemoryStats(state),
    onMemoryClick: () => goTo(history, '/inspect/result/files'),
    onCodeClick: () => goTo(history, '/inspect/result/defects'),
    onSymbolsClick: () => goTo(history, '/inspect/result/symbols')
  };
}

export default connect(mapStateToProps)(MemoryStatisticsPage);
