/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ReactGA from 'react-ga';
import qs from 'querystringify';


export function reportException(description, fatal=false) {
  if (description instanceof ErrorEvent) {
    description = [
      description.message,
      `${description.filename}:${description.lineno}`
    ];
  }
  ReactGA.exception({
    description: description.toString().substring(0, 2048),
    fatal
  });
}

export function getStartLocation() {
  let startLocation = null;
  if (window.location && window.location.search) {
    startLocation = qs.parse(window.location.search);
    startLocation = startLocation && startLocation.start ? startLocation.start : null;
  }
  return startLocation || '/';
}

export function goTo(history, path, state, redirect=false) {
  if (history.length) {
    const lastEntry = history.entries[history.index];
    if (redirect || (lastEntry.pathname === path && JSON.stringify(lastEntry.state) === JSON.stringify(state))) {
      return history.replace(path, state);
    }
  }
  history.push(path, state);
  ReactGA.ga('send', 'screenview', { screenName: path });
}

export function asyncDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function title(str) {
  return str[0].toUpperCase() + str.slice(1);
}

export function lastLine(text) {
  return text.trim().split('\n').slice(-1)[0];
}

export function cmpSort(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}
