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

import { Badge, Input, Spin } from 'antd';
import { hideProject, loadProjects, openProject } from '@project/actions';
import { lazyUpdateInputValue, updateInputValue } from '@store/actions';

import { BOARDS_INPUT_FILTER_KEY } from '@platform/selectors';
import { ProjectListItem } from '@project/components/list-item';
import { ProjectType } from '@project/types';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '@core/helpers';
import { osRevealFile } from '@core/actions';
import { selectProjects } from '@project/selectors';

const ACTION_HIDE = 'hide';
const ACTION_REVEAL = 'reveal';
const ACTION_CONFIGURE = 'configure';
const ACTION_OPEN = 'open';

class ProjectsListComponent extends React.PureComponent {
  static propTypes = {
    // data
    history: PropTypes.object.isRequired,
    items: PropTypes.arrayOf(ProjectType),
    //callbacks
    loadProjects: PropTypes.func.isRequired,
    hideProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    updateInputValue: PropTypes.func.isRequired,
    showBoards: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    if (!this.props.items) {
      this.props.loadProjects();
    }
  }

  handleAction(name, projectDir) {
    switch (name) {
      case ACTION_CONFIGURE:
        goTo(this.props.history, '/projects/config', { projectDir });
        break;
      case ACTION_HIDE:
        this.props.hideProject(projectDir);
        break;
      case ACTION_REVEAL:
        this.props.osRevealFile(projectDir);
        break;
      case ACTION_OPEN:
        this.props.openProject(projectDir);
        break;
    }
  }

  handleSearch(search) {
    this.setState({
      search
    });
  }

  handleBoardClick(name) {
    this.props.updateInputValue(BOARDS_INPUT_FILTER_KEY, name);
    this.props.showBoards();
  }

  getActionsConfiguration() {
    return [
      [
        {
          name: ACTION_HIDE,
          icon: 'eye-invisible',
          text: 'Hide'
        },
        {
          name: ACTION_REVEAL,
          icon: 'eye',
          text: 'Reveal'
        }
      ],
      [
        {
          name: ACTION_OPEN,
          icon: 'folder-open',
          text: 'Open',
          type: 'primary'
        },
        {
          name: ACTION_CONFIGURE,
          icon: 'setting',
          text: 'Configure',
          type: 'primary'
        }
      ]
    ];
  }

  render() {
    if (!this.props.items) {
      return <Spin />;
    }
    const ds = this.props.items.filter(
      project =>
        this.state.search === undefined || project.name.includes(this.state.search)
    );
    return (
      <div className="project-list-page">
        <h1>
          Projects <Badge count={this.props.items.length} />
        </h1>
        <div className="block">
          <Input.Search
            allowClear
            enterButton
            placeholder="Search projects"
            onSearch={::this.handleSearch}
            size="large"
            style={{ width: '100%' }}
          />
        </div>
        {this.state.search && <h2>Search Results ({ds.length}):</h2>}
        {!this.state.search && <h2>All Projects:</h2>}
        {ds.map(project => (
          <ProjectListItem
            key={project.path}
            data={project}
            actions={this.getActionsConfiguration()}
            onAction={::this.handleAction}
            onClick={() => this.handleAction(ACTION_CONFIGURE, project.path)}
            onBoardClick={::this.handleBoardClick}
          />
        ))}
      </div>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    items: selectProjects(state)
  };
};

function dispatchToProps(dispatch, ownProps) {
  return {
    ...bindActionCreators(
      {
        loadProjects,
        hideProject,
        openProject,
        osRevealFile,
        lazyUpdateInputValue,
        updateInputValue
      },
      dispatch
    ),
    showBoards: () => goTo(ownProps.history, '/boards')
  };
}

export const ProjectsListPage = connect(
  mapStateToProps,
  dispatchToProps
)(ProjectsListComponent);
