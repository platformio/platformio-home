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

import { Alert, Carousel, Icon } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';

export default class ProjectInitCarousel extends React.Component {
  static propTypes = {
    osOpenUrl: PropTypes.func.isRequired
  };

  render() {
    return (
      <Carousel className="project-init-carousel" autoplay autoplaySpeed={3000}>
        <div>
          <Alert
            showIcon
            message="Please wait..."
            description={
              <div>
                <div className="block">
                  The first initialization requires Internet connection and{' '}
                  <b>may take a while</b> (need to install dependent toolchains,
                  frameworks, SDKs).
                </div>
                <div>Please be patient and let the initialization complete.</div>
              </div>
            }
          />
        </div>
        <div>
          <Alert
            showIcon
            message="Project Structure"
            description={
              <div>
                <div className="block">
                  PlatformIO project consists of 3 main items:
                </div>
                <ul>
                  <li>
                    <Icon type="folder" /> <code>lib</code> - put here project specific
                    (private) libraries
                  </li>
                  <li>
                    <Icon type="folder" /> <code>src</code> - put your source files in
                    this folder
                  </li>
                  <li>
                    <Icon type="file" /> <code>platformio.ini</code> - project
                    configuration file
                  </li>
                </ul>
              </div>
            }
          />
        </div>
        <div>
          <Alert
            showIcon
            message="platformio.ini"
            description={
              <div>
                <div>PlatformIO Project Configuration File:</div>
                <ul className="block list-styled">
                  <li>
                    <code>Generic options</code> - development platforms, boards,
                    frameworks
                  </li>
                  <li>
                    <code>Build options</code> - build flags, source filter, extra
                    scripting
                  </li>
                  <li>
                    <code>Upload options</code> - custom port, speed and extra flags
                  </li>
                  <li>
                    <code>Library options</code> - dependencies, extra library storages
                  </li>
                </ul>
                <div>
                  <a
                    onClick={() =>
                      this.props.osOpenUrl(
                        'http://docs.platformio.org/page/projectconf.html'
                      )
                    }
                  >
                    <Icon type="link" /> Please visit documentation
                  </a>{' '}
                  for the other options and examples.
                </div>
              </div>
            }
          />
        </div>
        <div>
          <Alert
            showIcon
            message="Upload Port"
            description={
              <div>
                <div className="block">
                  PlatformIO automatically detects upload port by default. You can
                  configure a custom port using <code>upload_port</code> option in{' '}
                  <b>platformio.ini</b>:
                </div>
                <ul className="block list-styled">
                  <li>
                    <code>upload_port = COM1</code> - particular port
                  </li>
                  <li>
                    <code>upload_port = /dev/ttyUSB*</code> - any port that starts with
                    /dev/ttyUSB
                  </li>
                  <li>
                    <code>upload_port = COM[13]</code> - COM1 or COM3.
                  </li>
                </ul>
              </div>
            }
          />
        </div>
      </Carousel>
    );
  }
}
