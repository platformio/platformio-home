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

import * as path from '../../core/path';

import { Button, Col, Row } from 'antd';

import CodeBeautifier from '../../core/containers/code-beautifier';
import PropTypes from 'prop-types';
import React from 'react';

export default class LibraryDetailManifestBlock extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      confurl: PropTypes.string,
      __pkg_dir: PropTypes.string
    }).isRequired,
    manifestContent: PropTypes.string,
    osOpenUrl: PropTypes.func.isRequired
  };

  onDidEdit(url) {
    if (url.startsWith('https://raw.githubusercontent.com')) {
      const matches = url.match(new RegExp('content.com/([^/]+/[^/]+)/(.+)$'));
      if (matches) {
        return this.props.osOpenUrl(
          `https://github.com/${matches[1]}/blob/${matches[2]}`
        );
      }
    }
    this.props.osOpenUrl(url);
  }

  render() {
    const uri =
      this.props.data.confurl || path.join(this.props.data.__pkg_dir, '.library.json');
    const content = this.props.data.confurl
      ? undefined
      : JSON.stringify(this.props.data, null, 2);
    const lang =
      this.props.data.confurl && this.props.data.confurl.endsWith('.ini')
        ? 'ini'
        : 'json';
    return (
      <div className="lib-manifest">
        <Row className="block">
          <Col xs={18}>
            <span className="inline-block-tight">Specification for manifests:</span>
            <span className="inline-block-tight">
              <a
                onClick={() =>
                  this.props.osOpenUrl(
                    'http://docs.platformio.org/page/librarymanager/config.html'
                  )
                }
              >
                library.json
              </a>
              ,
            </span>
            <span className="inline-block-tight">
              <a
                onClick={() =>
                  this.props.osOpenUrl(
                    'https://github.com/arduino/Arduino/wiki/Arduino-IDE-1.5:-Library-specification'
                  )
                }
              >
                library.properties
              </a>
              ,
            </span>
            <span className="inline-block-tight">
              <a
                onClick={() =>
                  this.props.osOpenUrl(
                    'http://yottadocs.mbed.com/reference/module.html'
                  )
                }
              >
                module.json
              </a>
            </span>
          </Col>
          <Col xs={6} className="text-right">
            {this.props.data.confurl && (
              <Button
                size="small"
                icon="edit"
                onClick={() => this.onDidEdit(this.props.data.confurl)}
              >
                Edit Manifest
              </Button>
            )}
          </Col>
        </Row>
        <CodeBeautifier uri={uri} content={content} language={lang} toggle />
      </div>
    );
  }
}
