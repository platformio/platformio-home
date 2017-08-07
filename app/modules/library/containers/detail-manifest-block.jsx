/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
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
    openUrl: PropTypes.func.isRequired
  }

  onDidEdit(url) {
    if (url.startsWith('https://raw.githubusercontent.com')) {
      const matches = url.match(new RegExp('content\.com/([^/]+/[^/]+)/(.+)$'));
      if (matches) {
        return this.props.openUrl(`https://github.com/${matches[1]}/blob/${matches[2]}`);
      }
    }
    this.props.openUrl(url);
  }

  render() {
    const uri = this.props.data.confurl || path.join(this.props.data.__pkg_dir, '.library.json');
    const content = this.props.data.confurl ? undefined : JSON.stringify(this.props.data, null, 2);
    const lang = this.props.data.confurl && this.props.data.confurl.endsWith('.ini') ? 'ini' : 'json';
    return (
      <div className='lib-manifest'>
        <Row className='block'>
          <Col xs={ 18 }>
            <span className='inline-block-tight'>Specification for manifests:</span>
            <span className='inline-block-tight'><a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/librarymanager/config.html') }>library.json</a>,</span>
            <span className='inline-block-tight'><a onClick={ () => this.props.openUrl('https://github.com/arduino/Arduino/wiki/Arduino-IDE-1.5:-Library-specification') }>library.properties</a>,</span>
            <span className='inline-block-tight'><a onClick={ () => this.props.openUrl('http://yottadocs.mbed.com/reference/module.html') }>module.json</a></span>
          </Col>
          <Col xs={ 6 } className='text-right'>
            { this.props.data.confurl &&
              <Button size='small' icon='edit' onClick={ () => this.onDidEdit(this.props.data.confurl) }>
                Edit Manifest
              </Button> }
          </Col>
        </Row>
        <CodeBeautifier uri={ uri } content={ content } language={ lang } toggle />
      </div>
      );
  }

}
