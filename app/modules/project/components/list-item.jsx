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
import { Button, Card, Dropdown, Icon, Menu, Tag, Tooltip } from 'antd';

import PropTypes from 'prop-types';
import { QuickEdit } from '@project/components/quick-edit';
import React from 'react';
import humanize from 'humanize';

export class ProjectListItem extends React.PureComponent {
  static propTypes = {
    // data
    data: ProjectType,
    actions: PropTypes.arrayOf(PropTypes.arrayOf(ActionType)),
    extraActions: PropTypes.arrayOf(ActionType),
    // callbacks
    onAction: PropTypes.func,
    onClick: PropTypes.func,
    onBoardClick: PropTypes.func,
    updateConfigDescription: PropTypes.func.isRequired
  };

  handleActionClick(e, name) {
    e.preventDefault();
    e.stopPropagation();
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

  handleSaveDescription(description, onEnd) {
    this.props.updateConfigDescription(this.props.data.path, description, onEnd);
  }

  handleClick = e => {
    e.preventDefault();
    this.props.onClick(e);
  };

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

  renderExtraActions() {
    if (!this.props.extraActions) {
      return;
    }
    const menu = (
      <Menu onClick={({ key, domEvent }) => this.handleActionClick(domEvent, key)}>
        {this.props.extraActions.map(action => (
          <Menu.Item key={action.name}>
            {action.icon && (
              <React.Fragment>
                <Icon type={action.icon} />{' '}
              </React.Fragment>
            )}
            {action.text}
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <Dropdown overlay={menu}>
        <Button size="small" type="link" onClick={e => e.stopPropagation()}>
          <Icon
            type="ellipsis"
            rotate={90}
            style={{ color: 'grey', fontSize: 16, verticalAlign: 'middle' }}
          />
        </Button>
      </Dropdown>
    );
  }

  render() {
    return (
      <Card
        className="list-item-card"
        extra={
          <React.Fragment>
            <small>
              <Tooltip
                title={`Last Modified: ${new Date(
                  this.props.data.modified * 1000
                ).toString()}`}
              >
                <Icon type="clock-circle" />{' '}
                {humanize.relativeTime(this.props.data.modified)}
              </Tooltip>
            </small>{' '}
            {this.renderExtraActions()}
          </React.Fragment>
        }
        title={<a onClick={this.handleClick}>{this.props.data.name}</a>}
      >
        <div className="block">
          <QuickEdit
            placeholder="No description"
            value={this.props.data.description}
            onSave={::this.handleSaveDescription}
          />
        </div>
        <div className="pull-right">
          {this.props.actions &&
            this.props.actions.map((actions, i) => (
              <Button.Group key={i}>
                {actions.map(action => (
                  <Button
                    key={action.name}
                    icon={action.icon}
                    type={action.type}
                    onClick={e => this.handleActionClick(e, action.name)}
                  >
                    {action.text}
                  </Button>
                ))}
              </Button.Group>
            ))}
        </div>
        <div className="environments-list">
          <Tooltip title="Environments">
            <Icon type="environment" />
          </Tooltip>{' '}
          {this.props.data.envs.map(env => (
            <Tag key={env}>{env}</Tag>
          ))}
        </div>
        {this.props.data.boards.length > 0 && this.renderBoards()}
      </Card>
    );
  }
}
