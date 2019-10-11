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

import * as store from './store/index';

import { getStartLocation, reportException } from './modules/core/helpers';

import App from './app.jsx';
import { AppContainer } from 'react-hot-loader';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import React from 'react';
import { render } from 'react-dom';

window.addEventListener('error', err => reportException(err, true));

render(
  <AppContainer>
    <Provider store={store.getStore()}>
      <MemoryRouter initialEntries={[getStartLocation()]}>
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
        <Provider store={newStoreModule.configureStore()}>
          <MemoryRouter>
            <NewApp />
          </MemoryRouter>
        </Provider>
      </AppContainer>,
      document.getElementById('app')
    );
  });
}
