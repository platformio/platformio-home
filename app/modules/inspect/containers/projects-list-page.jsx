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
  ACTION_INSPECT,
  ProjectCard,
  ProjectType
} from '@inspect/components/project-card';

import { Badge, Spin } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

import { connect } from 'react-redux';
import { inspectProject } from '@inspect/actions';
import { loadProjects } from '@project/actions';
import { selectVisibleProjects } from '@project/selectors';

class ProjectsListPage extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(ProjectType),
    loadProjects: PropTypes.func.isRequired,
    inspectProject: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired
  };

  constructor(...args) {
    super(...args);

    this.props.loadProjects();
  }

  handleProjectAction = action => {
    if (action.name !== ACTION_INSPECT) {
      return;
    }
    const { path, environments, inspectCode } = action;
    this.props.inspectProject(path, environments, inspectCode, true);
    this.props.history.push('/inspect/result/stats');
  };

  render() {
    const { items } = this.props;
    return (
      <div style={{ paddingTop: 12 }}>
        <div>
          <h1>
            Project Available To Inspect{' '}
            {<Badge overflowCount={100000} count={(items && items.length) || 0} />}
          </h1>
        </div>
        {!items && (
          <div className="text-center">
            <Spin tip="Loading..." size="large" />
          </div>
        )}
        {items &&
          items.map(item => (
            <ProjectCard
              key={item.path}
              data={item}
              onAction={this.handleProjectAction}
            />
          ))}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    items: selectVisibleProjects(state)
  };
}

const mapDispatchToProps = {
  loadProjects,
  inspectProject
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsListPage);
