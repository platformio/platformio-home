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

import * as path from '../path';

import { Icon, Spin } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import hljs from 'highlight.js';
import { requestContent } from '../actions';
import { selectRequestedContent } from '../selectors';

class CodeBeautifier extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    uri: PropTypes.string,
    content: PropTypes.string,
    language: PropTypes.string,
    className: PropTypes.string,
    toggle: PropTypes.bool,
    requestContent: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);

    this._codeElement = null;
    this._codeTogglePlaceholder = null;

    if (!this.props.content && this.props.uri) {
      this.props.requestContent({ uri: this.props.uri, cacheValid: '7d' });
    }
  }

  componentDidMount() {
    this.highlightCode();
  }

  componentDidUpdate() {
    this.highlightCode();
  }

  highlightCode() {
    if (this._codeElement) {
      hljs.highlightBlock(this._codeElement);
    }
  }

  onDidToggle(e) {
    e.target.classList.toggle('anticon-up-circle-o');
    e.target.classList.toggle('anticon-down-circle-o');
    this._codeTogglePlaceholder.classList.toggle('hide');
  }

  renderToggler() {
    return (
      <Icon
        type="up-circle-o"
        className="source-code-toggler"
        title="Show/Hide source code"
        onClick={e => this.onDidToggle(e)}
      />
    );
  }

  renderFileContent() {
    if (!this.props.content) {
      return (
        <div className="text-center">
          <Spin tip="Loading..." />
        </div>
      );
    }
    return (
      <pre>
        <code
          ref={code => (this._codeElement = code)}
          className={this.props.language || 'c'}
        >
          {this.props.content}
        </code>
      </pre>
    );
  }

  render() {
    if (!this.props.toggle) {
      return <div className={this.props.className}>{this.renderFileContent()}</div>;
    }
    return (
      <div className={this.props.className}>
        <h3>
          <Icon type="file" /> {this.props.title || path.basename(this.props.uri)}{' '}
          {this.renderToggler()}
        </h3>
        <div ref={item => (this._codeTogglePlaceholder = item)}>
          {this.renderFileContent()}
        </div>
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  if (!ownProps.uri || ownProps.content) {
    return {};
  }
  return {
    content: selectRequestedContent(state, ownProps.uri)
  };
}

export default connect(mapStateToProps, { requestContent })(CodeBeautifier);
