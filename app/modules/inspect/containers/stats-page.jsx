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
    onMemoryClick: PropTypes.func,
    onCodeClick: PropTypes.func
  };

  static formatPercent(value) {
    return <a>{value.toFixed(0) + '%'}</a>;
  }

  formatDefects() {
    return <a>{this.props.code.defectsCountTotal}</a>;
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

  renderLoader() {
    return (
      <div className="text-center">
        <Spin tip="Loading..." size="large" />
      </div>
    );
  }

  renderGauges() {
    let ramPercent;
    let flashPercent;

    if (this.props.memory) {
      ramPercent = (this.props.memory.ram / this.props.device.ram) * 100;
      flashPercent = (this.props.memory.flash / this.props.device.flash) * 100;
    }

    return (
      <Row gutter={16} className="block text-center inspect-dashboards">
        {ramPercent !== undefined && (
          <Col xs={12} sm={8} lg={4} className={this.getGaugeCls(ramPercent)}>
            <Tooltip
              title={`${formatSize(this.props.memory.ram)} of ${formatSize(
                this.props.device.ram
              )}`}
            >
              <Progress
                type="dashboard"
                format={MemoryStatisticsPage.formatPercent}
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
                format={MemoryStatisticsPage.formatPercent}
                onClick={::this.handleMemoryClick}
                percent={flashPercent}
                width={120}
              />
            </Tooltip>
            <h4>Flash</h4>
          </Col>
        )}
        {this.props.code && this.props.code.defectsCountTotal !== 0 && (
          <Col xs={12} sm={8} lg={4} className={this.getDefectsCls()}>
            <Tooltip title={this.getDefectsTooltip()}>
              <Progress
                type="dashboard"
                format={::this.formatDefects}
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
              <tr key={path}>
                <td className="text-right">
                  <b>{formatSize(flash)}</b>
                </td>
                <td>
                  <Tooltip title={path}>{limitPathLength(path, 50)}</Tooltip>
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
              <tr key={symbol.displayName}>
                <td className="text-right">
                  <b>{formatSize(symbol.size)}</b>
                </td>
                <td>
                  <Tooltip title={symbol.type + ' -> ' + symbol.location}>
                    <Icon
                      title={SYMBOL_NAME_BY_TYPE[symbol.type]}
                      type={SYMBOL_ICON_BY_TYPE[symbol.type]}
                    />{' '}
                    {symbol.displayName}
                  </Tooltip>
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
        render: text => <b>{text}</b>
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
      <Card title="Defects Summary" className="block">
        <Table
          columns={columns}
          dataSource={this.props.code.stats}
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
        dataIndex: 'severity'
      },
      {
        title: 'Message',
        dataIndex: 'message',
        render: (message, { file, line, column }) =>
          (<Tooltip title={ `${limitPathLength(file || '', 40)}:${line}:${column}` }>{message}</Tooltip>)
      },
    ];
    return (
      <Card title="Top Defects" className="block">
        <Table
          columns={columns}
          dataSource={this.props.code.topDefects.map((x, idx) => ({ ...x, idx }))}
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
        {this.renderGauges()}
        {this.props.memory && (
          <Row gutter={12}>
            <Col sm={12}>{this.renderTopFiles()}</Col>
            <Col sm={12}>{this.renderTopSymbols()}</Col>
          </Row>
        )}
        {this.props.code && (
          <Row gutter={12}>
            <Col sm={12}>{this.renderDefectsStats()}</Col>
            <Col sm={12}>{this.renderTopDefects()}</Col>
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
    onCodeClick: () => goTo(history, '/inspect/result/defects')
  };
}

export default connect(mapStateToProps)(MemoryStatisticsPage);
