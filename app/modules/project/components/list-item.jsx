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
import { Button, Card, Icon, Tag, Tooltip } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import humanize from 'humanize';

export class ProjectListItem extends React.PureComponent {
  static propTypes = {
    // data
    data: ProjectType,
    actions: PropTypes.arrayOf(PropTypes.arrayOf(ActionType)),
    // callbacks
    onAction: PropTypes.func,
    onClick: PropTypes.func,
    onBoardClick: PropTypes.func
  };

  handleActionClick(name) {
    if (this.props.onAction) {
      this.props.onAction(name, this.props.data.path);
    }
  }

  handleBoardClick(e, name) {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.onBoardClick) {
      this.props.onBoardClick(name);
    }
  }

  handleInlineEditClick(e) {
    e.preventDefault();
    e.stopPropagation();
    // TODO:
  }

  renderBoards() {
    const set = new Set();
    return (
      <div>
        <Tooltip title="Boards">
          <Icon type="calculator" />
        </Tooltip>{' '}
        {this.props.data.boards
          .filter(({ id }) => !set.has(id) && set.add(id))
          .map(({ name, id }, i) => (
            <React.Fragment key={id}>
              {i ? ', ' : ''}
              <a onClick={e => this.handleBoardClick(e, name)}>{name}</a>
            </React.Fragment>
          ))}
      </div>
    );
  }

  render() {
    return (
      <Card
        className="list-item-card"
        extra={
          <small>
            <Tooltip
              title={`Last Modified: ${new Date(
                this.props.data.modified * 1000
              ).toString()}`}
            >
              <Icon type="clock-circle" />{' '}
              {humanize.relativeTime(this.props.data.modified)}
            </Tooltip>
          </small>
        }
        hoverable
        onClick={this.props.onClick}
        title={this.props.data.name}
      >
        {
          <div className="block">
            {this.props.data.description || 'No description'}{' '}
            <Tooltip title="Inline edit description">
              <Button
                icon="edit"
                size="small"
                type="link"
                onClick={::this.handleInlineEditClick}
              ></Button>
            </Tooltip>
          </div>
        }
        <div className="block">
          <div>
            <Tooltip title="Environments">
              <Icon type="environment" />
            </Tooltip>{' '}
            {this.props.data.envs.map(env => (
              <Tag key={env}>{env}</Tag>
            ))}
          </div>
          {this.props.data.boards.length > 0 && this.renderBoards()}
        </div>
        <div>
          {this.props.actions &&
            this.props.actions.map((actions, i) => (
              <Button.Group key={i}>
                {actions.map(action => (
                  <Button
                    key={action.name}
                    icon={action.icon}
                    size="small"
                    type={action.type}
                    onClick={() => this.handleActionClick(action.name)}
                  >
                    {action.text}
                  </Button>
                ))}
              </Button.Group>
            ))}
        </div>
      </Card>
    );
  }
}
