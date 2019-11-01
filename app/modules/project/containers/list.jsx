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

import { Badge, Spin } from 'antd';
import { ProjectListItem } from '@project/components/list-item';
import { ProjectType } from '@project/types';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '@core/helpers';
import { loadProjects } from '@project/actions';
import { selectProjects } from '@project/selectors';

const ACTION_SETTINGS = 'settings';
const ACTION_OPEN = 'open';

class ProjectsListComponent extends React.PureComponent {
  static propTypes = {
    // data
    history: PropTypes.object.isRequired,
    items: PropTypes.arrayOf(ProjectType),
    //callbacks
    loadProjects: PropTypes.func.isRequired
  };

  componentDidMount() {
    if (!this.props.items) {
      this.props.loadProjects();
    }
  }

  handleAction(name, projectDir) {
    switch (name) {
      case ACTION_SETTINGS:
        goTo(this.props.history, '/projects/settings', { projectDir });
        break;
    }
  }

  getActionsConfiguration() {
    return [
      {
        name: ACTION_OPEN,
        icon: 'folder',
        text: 'Open'
      },
      {
        name: ACTION_SETTINGS,
        icon: 'setting',
        text: 'Configure'
      }
    ];
  }

  render() {
    if (!this.props.items) {
      return <Spin />;
    }
    return (
      <div className="project-list-page">
        <h1>
          Projects <Badge count={this.props.items.length} />
        </h1>
        {this.props.items.map(project => (
          <ProjectListItem
            key={project.path}
            data={project}
            actions={this.getActionsConfiguration()}
            onAction={::this.handleAction}
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
const dispatchToProps = {
  loadProjects
};

export const ProjectsListPage = connect(
  mapStateToProps,
  dispatchToProps
)(ProjectsListComponent);
