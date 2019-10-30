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

import { Alert, Tooltip } from 'antd';
import {
  selectCodeStats,
  selectInspectionResult,
  selectMemoryStats,
  selectSavedConfiguration
} from '@inspect/selectors';

import { ConfigurationType } from '@inspect/types';
import { METRICS_KEY } from '@inspect/constants';
import { Progress } from '@inspect/components/progress';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { selectProjectInfo } from '@project/selectors';
import { selectStorageItem } from '@store/selectors';

const DEFAULT_MEMORY_INSPECT_DURATION_MS = 5000;
const DEFAULT_CODE_INSPECT_DURATION_MS = 1500;

class InspectionProcessing extends React.PureComponent {
  static propTypes = {
    // data
    configuration: ConfigurationType,
    data: PropTypes.object,
    memoryDone: PropTypes.bool,
    memoryDuration: PropTypes.number,
    codeDone: PropTypes.bool,
    codeDuration: PropTypes.number,
    projectName: PropTypes.string
  };

  render() {
    const steps = [];
    if (this.props.configuration.memory) {
      steps.push({
        done: this.props.memoryDone,
        expectedDuration:
          this.props.memoryDuration || DEFAULT_MEMORY_INSPECT_DURATION_MS,
        name: 'Memory'
      });
    }
    if (this.props.configuration.code) {
      steps.push({
        done: this.props.codeDone,
        expectedDuration: this.props.codeDuration || DEFAULT_CODE_INSPECT_DURATION_MS,
        name: 'Code'
      });
    }
    return (
      <div className="inspect-processing-page">
        <h1 style={{ marginTop: 10, marginBottom: 0 }}>
          <Tooltip title={this.props.configuration.projectDir}>
            {this.props.projectName}
          </Tooltip>
          <small>
            {' '}
            <b>env:{this.props.configuration.env}</b>
          </small>
        </h1>
        {(!this.props.data || !this.props.data.error) && <Progress steps={steps} />}
        {this.props.data && this.props.data.error && (
          <Alert
            type="error"
            showIcon
            message="Sorry, error occurred during inspection"
            description={
              <div className="inspect-config-console">{this.props.data.error}</div>
            }
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const configuration = selectSavedConfiguration(state);
  const project = selectProjectInfo(state, configuration.projectDir);

  return {
    configuration,
    codeDuration: selectStorageItem(
      state,
      [METRICS_KEY, configuration.projectDir, configuration.env, 'code'].join(':')
    ),
    memoryDuration: selectStorageItem(
      state,
      [METRICS_KEY, configuration.projectDir, configuration.env, 'memory'].join(':')
    ),
    data: selectInspectionResult(state),
    codeDone: !!selectCodeStats(state),
    memoryDone: !!selectMemoryStats(state),
    projectName: project.name
  };
}
export const InspectionProcessingPage = connect(mapStateToProps)(InspectionProcessing);
