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

import { Button, Card, Checkbox, Col, Row } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { TagSelect } from './tag-select';
import humanize from 'humanize';

export const ACTION_INSPECT = 'inspect';
export const ACTION_VIEW = 'view';

export const ProjectType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  modified: PropTypes.number.isRequired,
  boards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  envLibStorages: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired
    })
  )
});

export class ProjectCard extends React.PureComponent {
  static propTypes = {
    data: ProjectType.isRequired,
    inspectionStatus: PropTypes.string,
    onAction: PropTypes.func
  };

  constructor(...args) {
    super(...args);
    const { envLibStorages = [] } = this.props.data;
    // Preselect all envs
    this.state = {
      selectedEnvs: envLibStorages.map(({ name }) => name)
    };
  }

  handleInspectAction = e => {
    const { onAction } = this.props;
    if (!onAction) {
      return;
    }
    const { selectedEnvs, inspectCode } = this.state;
    onAction({
      name: ACTION_INSPECT,
      path: e.target.closest('button').dataset.path,
      environments: selectedEnvs,
      inspectCode
    });
  };

  handleViewAction = () => {
    const { onAction } = this.props;
    if (!onAction) {
      return;
    }
    onAction({
      name: ACTION_VIEW
    });
  };

  handleEnvChange = selectedEnvs => {
    this.setState({
      selectedEnvs
    });
  };

  handleCodeChange = e => {
    this.setState({
      inspectCode: e.target.checked
    });
  };

  render() {
    const { data, inspectionStatus } = this.props;
    const inspectionReady = inspectionStatus && inspectionStatus === 'ready';
    const { name, path, modified, envLibStorages = [] } = data;
    const envs = envLibStorages.map(({ name: x }) => x);
    const { selectedEnvs } = this.state;
    const buttonsMinWidth = 120;

    const header = (
      <div className="clearfix">
        <div className="pull-left">
          <a>{name}</a>{' '}
          <small>
            modified{' '}
            <span title={new Date(modified * 1000)}>
              {humanize.relativeTime(modified)}
            </span>
          </small>
        </div>
      </div>
    );

    return (
      <Card hoverable title={header} className="list-item-card">
        <Row className="block">
          <Col sm={24}>
            <span>Environments: </span>
            <TagSelect
              items={envs.map(env => ({
                name: env,
                checked: selectedEnvs.includes(env)
              }))}
              onChange={this.handleEnvChange}
            />
          </Col>
        </Row>
        <Row className="block">
          <Col>
            <Checkbox onChange={this.handleCodeChange}>Inspect Code</Checkbox>
          </Col>
        </Row>
        <Row className="block">
          <Col sm={24}>
            <div className="inline-buttons">
              <Button
                loading={inspectionStatus && inspectionStatus.endsWith('ing')}
                size="large"
                icon="caret-right"
                key="inspect"
                data-path={path}
                type={inspectionReady ? 'default' : 'primary'}
                onClick={this.handleInspectAction}
                style={{ minWidth: buttonsMinWidth }}
              >
                Inspect
              </Button>

              <Button
                disabled={!inspectionReady}
                size="large"
                icon="monitor"
                key="view"
                data-path={path}
                type="primary"
                onClick={this.handleViewAction}
                style={{ minWidth: buttonsMinWidth }}
              >
                View
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    );
  }
}
