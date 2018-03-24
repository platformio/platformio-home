/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const urls = {
  home: 'https://platformio.org',
  twitter: 'https://twitter.com/PlatformIO_Org',
  facebook: 'https://www.facebook.com/platformio',
  linkedin: 'https://www.linkedin.com/company/platformio',
  github: 'https://github.com/platformio',
};

const messages = {
  homeQuickButtonProjectExamples: 'Project Examples'
};

export default {
  name: 'platformio',
  title: 'PlatformIO',
  companyLogoSrc: require('./platformio_logo.png'),
  showPIOVersions: true,
  footerQuickLinks: [
    { title: 'Web', url: urls.home},
    { title: 'Open Source', url: urls.github},
    { title: 'Get Started', url: 'http://docs.platformio.org/page/ide/pioide.html'},
    { title: 'Docs', url: 'http://docs.platformio.org'},
    { title: 'News', url: urls.twitter},
    { title: 'Community', url: 'https://community.platformio.org'},
    { title: 'Report an Issue', url: 'https://github.com/platformio/platformio/issues'},
    { title: 'Donate', url: 'https://platformio.org/donate'},
    { title: 'Contact', url: 'https://platformio.org/contact'},
  ],
  filterProjectExample: item => item.platform.title !== 'Aceinna IMU',
  filterPlatformCard: item => item.title !== 'Aceinna IMU',
  urls,
  messages
};
