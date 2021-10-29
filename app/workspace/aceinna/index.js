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

const urls = {
  home: 'https://www.aceinna.com/',
  welcome: 'https://github.com/Aceinna/platform-aceinna_imu#description',
  linkedin: 'https://www.linkedin.com/company/aceinna/',
  twitter: 'https://twitter.com/MEMSsensortech',
  github: 'https://github.com/aceinna',
  weibo: 'https://weibo.com/',
};

const messages = {
  homeQuickButtonProjectExamples: 'Custom IMU Examples',
  Boards: 'IMUs',
  'Search board...': 'Search IMU...',
};

export default {
  name: 'aceinna',
  title: "Aceinna's OpenIMU Platform",
  menuIgnorePatterns: [
    /^\/boards/,
    /^\/libraries\/builtin/,
    /^\/platforms\/(embedded|desktop|frameworks)/,
    /^\/device\//,
  ],
  ignoreQuickAccessButtons: ['new-project', 'import-arduino-project'],
  filterProjectExample: (item) => item.platform.title === 'Aceinna IMU',
  filterPlatformCard: (item) => item.title === 'Aceinna IMU',
  companyLogoSrc: require('./aceinna_logo.png').default,
  companyLogoHomeHeight: '150px',
  footerQuickLinks: [
    { title: 'Web', url: urls.home },
    { title: 'Open Source', url: urls.github },
    {
      title: 'Documentation',
      url: 'https://www.aceinna.com/support/technical-documentation.cfm',
    },
    { title: 'News', url: urls.twitter },
    { title: 'Contact', url: 'https://www.aceinna.com/about-aceinna/contact.cfm' },
  ],
  remapCustomIcons: {
    calculator: 'axis',
  },
  singleDevPlatform: true,
  urls,
  messages,
};
