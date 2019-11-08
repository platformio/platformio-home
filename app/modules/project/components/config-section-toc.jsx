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

import { Anchor } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

export class ConfigSectionToc extends React.PureComponent {
  static propTypes = {
    // data
    fields: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    schema: PropTypes.object,
    // callback
    onCreateId: PropTypes.func.isRequired
  };

  render() {
    const groups = new Set();
    const fieldsByGroup = [];
    this.props.fields.forEach(name => {
      const group = this.props.schema[name] ? this.props.schema[name].group : 'Custom';
      if (!groups.has(group)) {
        groups.add(group);
        fieldsByGroup[group] = [];
      }
      fieldsByGroup[group].push(name);
    });

    return (
      <Anchor className="toc">
        {[...groups].map(groupName => (
          <Anchor.Link
            className="config-section-group"
            href={`#${this.props.onCreateId('group', groupName)}`} // generateGroupAnchorId(sectionName, groupName)
            key={groupName}
            title={`${groupName} Options`}
          >
            {fieldsByGroup[groupName].map(name => (
              <Anchor.Link
                href={`#${this.props.onCreateId('field', name)}`} // this.generateFieldLabelId(sectionName, name)
                key={name}
                title={
                  (this.props.schema &&
                    this.props.schema[name] &&
                    this.props.schema[name].displayName) ||
                  name
                }
              />
            ))}
          </Anchor.Link>
        ))}
      </Anchor>
    );
  }
}
