/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const urls = {
  home: 'https://www.aceinna.com/',
  welcome: 'https://github.com/Aceinna/platform-aceinna_imu#description',
  linkedin: 'https://www.linkedin.com/company/aceinna/',
  twitter: 'https://twitter.com/MEMSsensortech',
  github: 'https://github.com/aceinna',
  weibo: 'https://weibo.com/'
};

const messages = {
  homeQuickButtonProjectExamples: 'Custom IMU Examples',
  Boards: 'IMUs',
  'Search board...': 'Search IMU...'
};

export default {
  name: 'aceinna',
  title: 'Aceinna\'s OpenIMU Platform',
  menuIgnorePatterns: [
    /^\/boards/,
    /^\/libraries/,
    /^\/platforms\/(embedded|desktop|frameworks)/,
    /^\/device\//
  ],
  ignoreQuickAccessButtons: [
    'new-project',
    'import-arduino-project'
  ],
  filterProjectExample: item => item.platform.title === 'Aceinna IMU',
  filterPlatformCard: item => item.title === 'Aceinna IMU',
  companyLogoSrc: require('./aceinna_logo.png'),
  companyLogoHomeHeight: '150px',
  footerQuickLinks: [
    { title: 'Web', url: urls.home},
    { title: 'Open Source', url: urls.github},
    { title: 'Documentation', url: 'https://www.aceinna.com/support/technical-documentation.cfm'},
    { title: 'News', url: urls.twitter},
    { title: 'Contact', url: 'https://www.aceinna.com/about-aceinna/contact.cfm'},
  ],
  remapCustomIcons: {
    calculator: 'axis'
  },
  singleDevPlatform: true,
  urls,
  messages
};
