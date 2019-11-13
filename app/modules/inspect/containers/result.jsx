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
import { bindActionCreators } from 'redux';
import childRoutes from '@inspect/result-routes';
import { connect } from 'react-redux';
import { goTo } from '@core/helpers';
import { osRevealFile } from '@core/actions';
import { reinspectProject } from '@inspect/actions';
import { selectProjectInfo } from '@project/selectors';

class InspectionResultComponent extends React.Component {
  static propTypes = {
    // data
    configuration: ConfigurationType,
    device: DeviceType,
    project: PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired
    }),
    // callbacks
    osRevealFile: PropTypes.func.isRequired,
    reinspectProject: PropTypes.func.isRequired,
    showConfiguration: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate() {
    if (!this.props.project) {
      this.props.showConfiguration();
    }
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
    if (!this.props.project) {
      // Will be redirected after render
      return null;
    }

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
          <Tooltip title={this.props.project.path}>{this.props.project.name}</Tooltip>
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
  return {
    project: selectProjectInfo(state, configuration.projectDir),
    configuration,
    device: selectDeviceInfo(state)
  };
}

function dispatchProps(dispatch, ownProps) {
  return {
    ...bindActionCreators(
      {
        osRevealFile,
        reinspectProject
      },
      dispatch
    ),
    showConfiguration: () => goTo(ownProps.history, '/inspect')
  };
}

export const InspectionResultPage = connect(
  mapStateToProps,
  dispatchProps
)(InspectionResultComponent);
