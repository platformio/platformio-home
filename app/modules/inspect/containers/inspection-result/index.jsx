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

// import { Breadcrumb } from 'antd';
// import { Link } from 'react-router';

import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import MultiPage from '@core/components/multipage';
import PropTypes from 'prop-types';
import React from 'react';
import childRoutes from './routes';

export default class InspectionResultPage extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired
  };

  renderBreadcrumb() {
    const breadcrumpMap = {
      '/inspect': 'Projects',
      '/inspect/result': '<Project Name>',
      '/inspect/result/stats': 'Stats',
      '/inspect/result/files': 'Files',
      '/inspect/result/symbols': 'Symbols',
      '/inspect/result/sections': 'Sections'
    };

    const parts = this.props.location.pathname.split('/');
    const items = parts
      .filter((_name, i) => i)
      .map((_name, i) => parts.slice(0, i + 2).join('/'))
      .filter(url => breadcrumpMap[url]);

    return (
      <Breadcrumb>
        {items.map((url, i) => (
          <Breadcrumb.Item key={i}>
            <Link to={url}>{breadcrumpMap[url]}</Link>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  }

  render() {
    return (
      <div style={{marginTop:12}}>
        {this.renderBreadcrumb()}
        <MultiPage routes={childRoutes} />
      </div>
    );
  }
}
