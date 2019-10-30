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

import { Progress as AntProgress } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

const MODE_LINEAR_TIME = 1;
const MODE_EXP_SLOWDOWN = 2;

const EXP_AFTER = 0.9;
const UPDATE_INTERVAL = 200;

export class Progress extends React.PureComponent {
  static propTypes = {
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        done: PropTypes.bool.isRequired,
        expectedDuration: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    ).isRequired
  };

  static getCurrentStep(props) {
    return props.steps.find(x => !x.done);
  }

  constructor(...args) {
    super(...args);
    const now = Date.now().valueOf();
    const currentStep = Progress.getCurrentStep(this.props);
    if (currentStep) {
      this.state = {
        mode: MODE_LINEAR_TIME,
        stepStartedAt: now,
        stepDuration: 0
      };
    } else {
      this.state = {};
    }
  }

  componentDidMount() {
    this.timer = setInterval(::this.handleTimer, UPDATE_INTERVAL);
  }

  componentDidUpdate(prevProps) {
    const oldStep = Progress.getCurrentStep(prevProps);
    const nextStep = Progress.getCurrentStep(this.props);
    if (oldStep && nextStep && oldStep.name !== nextStep.name) {
      // Start next step in the linear mode
      this.setState({
        mode: MODE_LINEAR_TIME,
        stepStartedAt: Date.now().valueOf(),
        stepDuration: 0
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getExpProgress(duration) {
    return EXP_AFTER + (1 - EXP_AFTER) * (1 - 1 / Math.exp(duration / 100000));
  }

  handleTimer() {
    this.setState(state => {
      const currentStep = Progress.getCurrentStep(this.props);
      if (!currentStep || !state.stepStartedAt) {
        // No step running or all steps completed
        clearInterval(this.timer);
        return;
      }
      const stepDuration = Date.now() - state.stepStartedAt;
      const result = { stepDuration };
      if (
        stepDuration / currentStep.expectedDuration >= EXP_AFTER &&
        state.mode !== MODE_EXP_SLOWDOWN
      ) {
        // Switch into exp mode
        result.mode = MODE_EXP_SLOWDOWN;
      }
      return result;
    });
  }

  render() {
    let completedProgress = 0;
    let ongoingProgress = 0;
    let stepName;
    const isAllDone = this.props.steps.every(x => x.done);

    if (isAllDone) {
      stepName = 'Complete';
      completedProgress = ongoingProgress = 1;
    } else {
      const stepCfg = Progress.getCurrentStep(this.props);
      const totalSteps = this.props.steps.length;
      const stepBaseProgress = this.props.steps.indexOf(stepCfg) / totalSteps;
      let stepProgress;
      if (this.state.mode === MODE_LINEAR_TIME) {
        stepProgress = this.state.stepDuration / stepCfg.expectedDuration;
      } else if (this.state.mode === MODE_EXP_SLOWDOWN) {
        stepProgress = this.getExpProgress(
          this.state.stepDuration - stepCfg.expectedDuration * EXP_AFTER
        );
      }
      ongoingProgress = stepBaseProgress + stepProgress / totalSteps;

      const doneSteps = this.props.steps.filter(x => x.done).length;
      if (totalSteps > 1) {
        completedProgress = doneSteps / totalSteps;
      }
      stepName = `Inspecting… ${stepCfg.name}`;
    }
    return (
      <div>
        <center>
          {stepName}: {(ongoingProgress * 100).toFixed(0)}%
        </center>
        <AntProgress
          format={x => `${x.toFixed(0)}%`}
          successPercent={completedProgress * 100}
          percent={ongoingProgress * 100}
        />
      </div>
    );
  }
}
