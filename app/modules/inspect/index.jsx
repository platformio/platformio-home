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

import { Redirect, Route } from 'react-router';

import MultiPage from '@core/components/multipage';
import { PREFIX } from '@inspect/constants';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { deleteEntity } from '@store/actions';
import routes from './routes';

class InspectPage extends React.Component {
  static propTypes = {
    deleteEntity: PropTypes.func.isRequired
  };

  componentWillUnmount() {
    // Delete all entities containing inspection results
    // But keep saved form
    this.props.deleteEntity(new RegExp(`^${PREFIX}:`));
  }

  render() {
    return (
      <section className="memory-inspect-module">
        <MultiPage routes={routes} disableMenu>
          <Route exact path="/inspect">
            {/* Use redirect to prevent rendering form on the results page */}
            <Redirect to="/inspect/form" />
          </Route>
        </MultiPage>
      </section>
    );
  }
}

const mapDispatchToProps = {
  deleteEntity
};

export default connect(
  undefined,
  mapDispatchToProps
)(InspectPage);
