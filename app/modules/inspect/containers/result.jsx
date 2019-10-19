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

import { Button } from 'antd';
import MultiPage from '@core/components/multipage';
import PropTypes from 'prop-types';
import React from 'react';
import childRoutes from '@inspect/result-routes';
import { connect } from 'react-redux';
import { reinspectProject } from '@inspect/actions';
import { selectProjectInfo } from '@project/selectors';
import { selectSavedConfiguration } from '@inspect/selectors';

class InspectionResultComponent extends React.Component {
  static propTypes = {
    // data
    projectName: PropTypes.string,
    // callbacks
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
    return (
      <div style={{ marginTop: 12 }}>
        <h1 style={{ marginBottom: 0, position: 'relative' }}>
          {this.props.projectName}
          <Button
            icon="reload"
            loading={this.state.loading}
            style={{ position: 'absolute', right: 0, top: 0 }}
            onClick={this.handleRefreshClick}
          >
            Refresh
          </Button>
        </h1>
        <MultiPage routes={routes} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { projectDir } = selectSavedConfiguration(state);
  const project = selectProjectInfo(state, projectDir);
  return {
    projectName: (project || {}).name
  };
}

const dispatchProps = {
  reinspectProject
};

export const InspectionResultPage = connect(
  mapStateToProps,
  dispatchProps
)(InspectionResultComponent);
