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
import MultiPage from '@core/components/multipage';
import PropTypes from 'prop-types';
import React from 'react';
import childRoutes from '@inspect/result-routes';
import { connect } from 'react-redux';
import { osRevealFile } from '@core/actions';
import { reinspectProject } from '@inspect/actions';
import { selectProjectInfo } from '@project/selectors';
import { selectSavedConfiguration } from '@inspect/selectors';

class InspectionResultComponent extends React.Component {
  static propTypes = {
    // data
    code: PropTypes.bool,
    memory: PropTypes.bool,
    projectDir: PropTypes.string,
    projectName: PropTypes.string,
    // callbacks
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
    this.props.osRevealFile(this.props.projectDir);
  };

  handleRefreshClick = () => {
    this.setState({ loading: true });
    this.props.reinspectProject(() => {
      if (this._isMounted) {
        this.setState({ loading: false });
      }
    });
  };

  render() {
    const routes = [...childRoutes.common];
    if (this.props.memory) {
      routes.push(...childRoutes.memory);
    }
    return (
      <div style={{ marginTop: 12 }}>
        <h1 style={{ marginBottom: 0, position: 'relative' }}>
          <Tooltip title={this.props.projectDir}>{this.props.projectName}</Tooltip>
          <div
            className="inline-buttons"
            style={{ position: 'absolute', right: 0, top: 0 }}
          >
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
          </div>
        </h1>
        <MultiPage routes={routes} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { projectDir, memory, code } = selectSavedConfiguration(state);
  const project = selectProjectInfo(state, projectDir);
  return {
    projectDir,
    projectName: (project || {}).name,
    memory,
    code
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
