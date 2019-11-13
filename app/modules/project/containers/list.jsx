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

import { Badge, Button, Input, Spin } from 'antd';
import {
  INPUT_FILTER_KEY,
  selectFilter,
  selectVisibleProjects
} from '@project/selectors';
import {
  hideProject,
  loadProjects,
  openProject,
  updateConfigDescription
} from '@project/actions';
import { lazyUpdateInputValue, updateInputValue } from '@store/actions';

import { BOARDS_INPUT_FILTER_KEY } from '@platform/selectors';
import { ProjectListItem } from '@project/components/list-item';
import ProjectNewModal from '@project/containers/new-modal';
import ProjectOpenModal from '@project/containers/open-modal';

import { ProjectType } from '@project/types';

import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '@core/helpers';
import { osRevealFile } from '@core/actions';

const ACTION_HIDE = 'hide';
const ACTION_REVEAL = 'reveal';
const ACTION_CONFIGURE = 'configure';
const ACTION_OPEN = 'open';

class ProjectsListComponent extends React.PureComponent {
  static propTypes = {
    // data
    filterValue: PropTypes.string,
    history: PropTypes.object.isRequired,
    items: PropTypes.arrayOf(ProjectType),
    //callbacks
    loadProjects: PropTypes.func.isRequired,
    hideProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    updateInputValue: PropTypes.func.isRequired,
    showBoards: PropTypes.func.isRequired,
    updateConfigDescription: PropTypes.func.isRequired,
    setFilter: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {
      newProjectVisible: false,
      openProjectVisible: false
    };
  }

  componentDidMount() {
    if (!this.props.items) {
      this.props.loadProjects();
    }
  }

  handleAction = (name, projectDir) => {
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
  };

  handleSearch = e => {
    this.props.setFilter(e.target.value);
  };

  handleBoardClick = name => {
    this.props.updateInputValue(BOARDS_INPUT_FILTER_KEY, name);
    this.props.showBoards();
  };

  handleUpdateConfigDescription = (projectDir, description, onEnd) => {
    this.props.updateConfigDescription(projectDir, description, onEnd);
  };

  handleOpenProjectClick = () => {
    this.setState({
      openProjectVisible: true
    });
  };

  handleOpenProjectCancel = () => {
    this.setState({
      openProjectVisible: false
    });
  };

  handleNewProjectCancel = () => {
    this.setState({
      newProjectVisible: false
    });
  };

  handleCreateNewProjectClick = () => {
    this.setState({
      newProjectVisible: true
    });
  };

  getActionsConfiguration() {
    return [
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

  getExtraActions() {
    return [
      {
        name: ACTION_HIDE,
        icon: 'eye-invisible',
        text: 'Hide'
      },
      {
        name: ACTION_REVEAL,
        icon: 'folder',
        text: 'Reveal'
      }
    ];
  }

  renderData() {
    const ds = this.props.items.slice().sort((a, b) => b.modified - a.modified);
    if (!ds.length) {
      return (
        <ul className="background-message text-center">
          <li>No Results</li>
        </ul>
      );
    }

    return (
      <div>
        {ds.map(project => (
          <ProjectListItem
            key={project.path}
            data={project}
            actions={this.getActionsConfiguration()}
            extraActions={this.getExtraActions()}
            onAction={this.handleAction}
            onClick={() => this.handleAction(ACTION_CONFIGURE, project.path)}
            onBoardClick={this.handleBoardClick}
            updateConfigDescription={this.handleUpdateConfigDescription}
          />
        ))}
      </div>
    );
  }

  renderModals() {
    return (
      <React.Fragment>
        <ProjectOpenModal
          skipOpenProject
          visible={this.state.openProjectVisible}
          onCancel={this.handleOpenProjectCancel}
        />
        <ProjectNewModal
          visible={this.state.newProjectVisible}
          onCancel={this.handleNewProjectCancel}
        />
      </React.Fragment>
    );
  }

  renderFormActions() {
    return (
      <div className="pull-right">
        <Button.Group>
          <Button
            icon="folder-open"
            type={this.props.items.length ? 'default' : 'primary'}
            onClick={this.handleOpenProjectClick}
          >
            Add Existing
          </Button>
          <Button
            icon="plus"
            type={this.props.items.length ? 'default' : 'primary'}
            onClick={this.handleCreateNewProjectClick}
          >
            Create New Project
          </Button>
        </Button.Group>
      </div>
    );
  }

  render() {
    return (
      <div className="project-list-page">
        {this.renderModals()}
        {!this.props.items && (
          <center>
            <Spin size="large" tip="Loading…" />
          </center>
        )}
        {this.props.items && (
          <div>
            <h1 className="block clearfix">
              <span>
                Projects <Badge count={this.props.items.length} />
              </span>
              {this.renderFormActions()}
            </h1>
            <div className="block">
              <Input.Search
                allowClear
                defaultValue={this.props.filterValue}
                enterButton
                placeholder="Search projects"
                onChange={this.handleSearch}
                ref={$el => ($el ? $el.focus() : null)}
                size="large"
                style={{ width: '100%' }}
              />
            </div>
            {this.renderData()}
            {this.props.items.length === 0 && (
              <div className="text-center">
                <ul className="list-inline">
                  <li>
                    <Button
                      icon="folder-open"
                      type="primary"
                      onClick={this.handleOpenProjectClick}
                    >
                      Add Existing
                    </Button>
                  </li>
                  <li>or</li>
                  <li>
                    <Button
                      icon="plus"
                      type="primary"
                      onClick={this.handleCreateNewProjectClick}
                    >
                      Create New Project
                    </Button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    filterValue: selectFilter(state),
    items: selectVisibleProjects(state)
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
        setFilter: value => dispatch(lazyUpdateInputValue(INPUT_FILTER_KEY, value)),
        updateInputValue,
        updateConfigDescription
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
