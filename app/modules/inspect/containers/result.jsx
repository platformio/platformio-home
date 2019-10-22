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

import { Button, Tooltip } from 'antd';
import { ConfigurationType, DeviceType } from '@inspect/types';
import { formatFrequency, formatSize } from '@inspect/helpers';
import { selectDeviceInfo, selectSavedConfiguration } from '@inspect/selectors';

import MultiPage from '@core/components/multipage';
import PropTypes from 'prop-types';
import React from 'react';
import childRoutes from '@inspect/result-routes';
import { connect } from 'react-redux';
import { osRevealFile } from '@core/actions';
import { reinspectProject } from '@inspect/actions';
import { selectProjectInfo } from '@project/selectors';

class InspectionResultComponent extends React.Component {
  static propTypes = {
    configuration: ConfigurationType,
    device: DeviceType,
    projectName: PropTypes.string,

    osRevealFile: PropTypes.func.isRequired,
    reinspectProject: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleRevealClick = () => {
    this.props.osRevealFile(this.props.configuration.projectDir);
  };

  handleRefreshClick = () => {
    this.setState({ loading: true });
    this.props.reinspectProject(() => {
      if (this._isMounted) {
        this.setState({ loading: false });
      }
    });
  };

  renderDeviceInfo() {
    return (
      <small>
        {this.props.device.mcu.toUpperCase()}{' '}
        {[
          formatFrequency(this.props.device.frequency),
          `${formatSize(this.props.device.ram)} RAM`,
          `${formatSize(this.props.device.flash)} Flash`
        ].join(', ')}{' '}
      </small>
    );
  }

  render() {
    const routes = [...childRoutes.common];
    if (this.props.configuration.memory) {
      routes.push(...childRoutes.memory);
    }
    if (this.props.configuration.code) {
      routes.push(...childRoutes.code);
    }
    return (
      <div>
        <h1 style={{ marginTop: 10, marginBottom: 0 }}>
          <Tooltip title={this.props.configuration.projectDir}>
            {this.props.projectName}
          </Tooltip>
          <small>
            {' '}
            <b>env:{this.props.configuration.env}</b>
          </small>

          <div className="pull-right">
            <Button.Group>
              <Button icon="folder-open" onClick={this.handleRevealClick}>
                Reveal
              </Button>
              <Button
                icon="reload"
                loading={this.state.loading}
                onClick={this.handleRefreshClick}
              >
                Refresh
              </Button>
            </Button.Group>
          </div>
        </h1>
        {this.props.device && this.renderDeviceInfo()}
        <MultiPage routes={routes} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const configuration = selectSavedConfiguration(state);
  const project = selectProjectInfo(state, configuration.projectDir);
  return {
    projectName: (project || {}).name,
    configuration,
    device: selectDeviceInfo(state)
  };
}

const dispatchProps = {
  osRevealFile,
  reinspectProject
};

export const InspectionResultPage = connect(
  mapStateToProps,
  dispatchProps
)(InspectionResultComponent);
