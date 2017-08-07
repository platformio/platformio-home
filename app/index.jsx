/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as store from './store/index';

import App from './app.jsx';
import { AppContainer } from 'react-hot-loader';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import React from 'react';
import { getStartLocation } from './modules/core/helpers';
import { render } from 'react-dom';


render(
  <AppContainer>
    <Provider store={ store.getStore() }>
      <MemoryRouter initialEntries={ [getStartLocation()] }>
        <App />
      </MemoryRouter>
    </Provider>
  </AppContainer>,
  document.getElementById('app')
);

if (module && module.hot) {
  module.hot.accept('./app.jsx', () => {
    const newStoreModule = require('./store/index');
    const NewApp = require('./app.jsx').default;
    render(
      <AppContainer>
        <Provider store={ newStoreModule.configureStore() }>
          <MemoryRouter>
            <NewApp />
          </MemoryRouter>
        </Provider>
      </AppContainer>,
      document.getElementById('app')
    );
  });
}
