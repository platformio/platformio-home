/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import 'highlight.js/styles/default.css';
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
  }

  constructor() {
    super(...arguments);
    this._codeElement = null;
    this._codeTogglePlaceholder = null;
  }

  componentWillMount() {
    if (!this.props.content && this.props.uri) {
      this.props.requestContent(this.props.uri);
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

  onDidToggle(event) {
    event.target.classList.toggle('anticon-up-circle-o');
    event.target.classList.toggle('anticon-down-circle-o');
    this._codeTogglePlaceholder.classList.toggle('hide');
  }

  renderToggler() {
    return (
      <Icon type='up-circle-o'
        className='source-code-toggler'
        title='Show/Hide source code'
        onClick={ (e) => this.onDidToggle(e) } />
      );
  }

  renderFileContent() {
    if (!this.props.content) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' />
        </div>
        );
    }
    return (
      <pre><code ref={ code => this._codeElement = code } className={ this.props.language || 'c' }>{ this.props.content }</code></pre>
    );
  }

  render() {
    if (!this.props.toggle) {
      return <div className={ this.props.className }>{ this.renderFileContent() }</div>;
    }
    return (
      <div className={ this.props.className }>
        <h3><Icon type='file' /> { this.props.title || path.basename(this.props.uri) } { this.renderToggler() }</h3>
        <div ref={ item => this._codeTogglePlaceholder = item }>
          { this.renderFileContent() }
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
