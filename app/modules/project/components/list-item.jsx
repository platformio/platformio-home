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

import { ActionType, ProjectType } from '@project/types';
import { Button, Card, Col, Row, Tag } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';

export class ProjectListItem extends React.PureComponent {
  static propTypes = {
    // data
    data: ProjectType,
    actions: PropTypes.arrayOf(ActionType),
    // callbacks
    onAction: PropTypes.func
  };

  handleActionClick(name) {
    if (this.props.onAction) {
      this.props.onAction(name, this.props.data.path);
    }
  }

  render() {
    return (
      <Card
        // hoverable
        title={this.props.data.name}
        // title={<a>{this.props.data.name}</a>}
        // extra={extra}
        // onClick={::this.onDidShow}
        className="list-item-card"
      >
        <div className="block">{this.props.data.description}</div>
        <Row className="block">
          <Col>
            Environments:{' '}
            {this.props.data.envs.map(env => (
              <Tag key={env}>{env}</Tag>
            ))}
          </Col>
        </Row>
        <Row>
          <Col>
            {this.props.actions && (
              <Button.Group>
                {this.props.actions.map(action => (
                  <Button
                    key={action.name}
                    icon={action.icon}
                    size="small"
                    // type="primary"
                    onClick={() => this.handleActionClick(action.name)}
                  >
                    {action.text}
                  </Button>
                ))}
              </Button.Group>
            )}
          </Col>
        </Row>
      </Card>
    );
  }
}
