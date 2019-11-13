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

import * as actions from '../actions';
import * as workspaceSettings from '../../../workspace/settings';

import { Button, Divider, Icon, Input, Spin, Table, Tooltip } from 'antd';
import { INPUT_FILTER_KEY, selectFilter, selectVisibleProjects } from '../selectors';
import { cmpSort, goTo } from '../../core/helpers';
import { lazyUpdateInputValue, updateInputValue } from '../../../store/actions';

import { BOARDS_INPUT_FILTER_KEY } from '../../platform/selectors';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import humanize from 'humanize';
import { osRevealFile } from '../../core/actions';

class RecentProjectsBlock extends React.Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
    showProjectExamplesModal: PropTypes.func.isRequired,
    showOpenProjectModal: PropTypes.func.isRequired,

    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        modified: PropTypes.number.isRequired,
        boards: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
          })
        )
      })
    ),

    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    updateInputValue: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    hideProject: PropTypes.func.isRequired,
    loadProjects: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    showBoards: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.props.loadProjects();
  }

  onDidShowBoard(name) {
    this.props.updateInputValue(BOARDS_INPUT_FILTER_KEY, name);
    this.props.showBoards();
  }

  getTableColumns() {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        className: 'text-word-break',
        sorter: (a, b) => cmpSort(a.name.toUpperCase(), b.name.toUpperCase())
      },
      {
        title: workspaceSettings.getMessage('Boards'),
        key: 'boards',
        className: 'text-word-break',
        render: (_, record) => {
          const known = [];
          return (
            <span>
              {record.boards
                .filter(board => {
                  if (known.includes(board.id)) {
                    return false;
                  }
                  known.push(board.id);
                  return true;
                })
                .map((board, index) => (
                  <span key={board.id}>
                    <a onClick={() => this.onDidShowBoard(board.name)}>{board.name}</a>{' '}
                    {record.boards.length > index + 1 ? ', ' : ''}
                  </span>
                ))}
            </span>
          );
        }
      },
      {
        title: 'Modified',
        key: 'modified',
        className: 'text-nowrap',
        sorter: (a, b) => cmpSort(b.modified, a.modified),
        render: (_, record) => (
          <Tooltip title={new Date(record.modified * 1000).toString()}>
            {humanize.relativeTime(record.modified)}
          </Tooltip>
        )
      },
      {
        title: 'Action',
        key: 'action',
        className: 'text-nowrap',
        width: 100,
        render: (text, record) => (
          <span>
            <a onClick={() => this.props.hideProject(record.path)}>Hide</a>{' '}
            <span className="ant-divider" />{' '}
            <a onClick={() => this.props.openProject(record.path)}>Open</a>
          </span>
        )
      }
    ];
  }

  render() {
    return (
      <div className="block">
        <Divider>Recent Projects</Divider>
        {this.renderProjects()}
      </div>
    );
  }

  renderProjects() {
    if (!this.props.items) {
      return (
        <div className="text-center">
          <Spin tip="Loading..." />
        </div>
      );
    } else if (!this.props.items.length && !this.props.filterValue) {
      return (
        <div className="text-center">
          <ul className="list-inline">
            <li>
              <Button
                icon="download"
                onClick={() => this.props.showProjectExamplesModal()}
              >
                Open Project Examples
              </Button>
            </li>
            <li>or</li>
            <li>
              <Button icon="download" onClick={() => this.props.showOpenProjectModal()}>
                Open Existing Project
              </Button>
            </li>
          </ul>
        </div>
      );
    }
    return (
      <div>
        <Input
          className="block"
          defaultValue={this.props.filterValue}
          placeholder="Search project..."
          onChange={e => this.props.setFilter(e.target.value)}
        />
        <Table
          rowKey="path"
          className="block"
          dataSource={this.props.items}
          columns={this.getTableColumns()}
          expandedRowRender={::this.renderExpandedRow}
          size="middle"
          pagination={{ defaultPageSize: 15, hideOnSinglePage: true }}
        />
      </div>
    );
  }

  renderExpandedRow(record) {
    return (
      <div>
        <Icon type="folder" className="inline-block-tight" />
        <a onClick={() => this.props.osRevealFile(record.path)}>{record.path}</a>
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisibleProjects(state),
    filterValue: selectFilter(state),
    showBoards: () => goTo(ownProps.router.history, '/boards')
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, actions, {
      osRevealFile,
      updateInputValue,
      setFilter: value => dispatch(lazyUpdateInputValue(INPUT_FILTER_KEY, value))
    }),
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(RecentProjectsBlock);
