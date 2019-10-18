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

import {
  selectProjectInspectionMeta,
  selectSavedConfiguration
} from '@inspect/selectors';

import { Button } from 'antd';
import { ConfigurationType } from '@inspect/types';
import MultiPage from '@core/components/multipage';
import PropTypes from 'prop-types';
import React from 'react';
import { Redirect } from 'react-router';
import childRoutes from './routes';
import { connect } from 'react-redux';
import { generateProjectNameFromPath } from '@inspect/helpers';
import { inspectProject } from '@inspect/actions';

class InspectionResultComponent extends React.Component {
  static propTypes = {
    status: PropTypes.string.isRequired,
    currentConfiguration: ConfigurationType.isRequired,
    onInspect: PropTypes.func.isRequired
  };

  handleRefreshClick = () => {
    const { onInspect, currentConfiguration } = this.props;
    onInspect(currentConfiguration, true);
  };

  render() {
    const { status, currentConfiguration } = this.props;
    const { projectDir, memory, code } = currentConfiguration;

    const routes = [...childRoutes.common];
    if (memory) {
      routes.push(...childRoutes.memory);
    }
    if (code) {
      routes.push(...childRoutes.code);
    }

    if (!routes.length) {
      // Result is no available or no tabs to show
      return <Redirect to="/inspect/form" />;
    }

    return (
      <div style={{ marginTop: 12 }}>
        <h1 style={{ marginBottom: 0, position: 'relative' }}>
          {generateProjectNameFromPath(projectDir)}
          <Button
            icon="reload"
            loading={status.endsWith('ing')}
            style={{ position: 'absolute', right: 0, top: 0 }}
            onClick={this.handleRefreshClick}
          >
            Refresh
          </Button>
        </h1>
        <small>{projectDir}</small>
        <MultiPage routes={routes} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    status: (selectProjectInspectionMeta(state) || {}).status || '',
    currentConfiguration: selectSavedConfiguration(state)
  };
}

const dispatchProps = {
  onInspect: inspectProject
};

export const InspectionResultPage = connect(
  mapStateToProps,
  dispatchProps
)(InspectionResultComponent);
