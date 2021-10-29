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

import MultiPage from '@core/components/multipage';
import PropTypes from 'prop-types';
import { RESULT_KEY } from '@inspect/constants';
import React from 'react';
import { connect } from 'react-redux';
import { deleteEntity } from '@store/actions';
import routes from './routes';

class InspectPage extends React.Component {
  static propTypes = {
    deleteEntity: PropTypes.func.isRequired,
  };

  componentWillUnmount() {
    // Delete inspection result
    this.props.deleteEntity(new RegExp(`^${RESULT_KEY}:`));
  }

  render() {
    return (
      <section className="page-container inspect-module">
        <MultiPage routes={routes} disableMenu />
      </section>
    );
  }
}

const mapDispatchToProps = {
  deleteEntity,
};

export default connect(undefined, mapDispatchToProps)(InspectPage);
