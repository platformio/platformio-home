/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import MultiPage from '../core/components/multipage';
import React from 'react';
import routes from './routes';


export default class PlatformPage extends React.Component {

  render() {
    return (
      <section className='platform-module'>
        <MultiPage routes={ routes } />
      </section>
    );
  }
}
