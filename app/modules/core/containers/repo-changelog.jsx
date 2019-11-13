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

import { Spin, Tooltip } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import URL from 'url-parse';
import { connect } from 'react-redux';
import humanize from 'humanize';
import marked from 'marked';
import { requestContent } from '../actions';
import { selectRequestedContent } from '../selectors';

class RepositoryChangelog extends React.Component {
  static propTypes = {
    uri: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object),
    requestContent: PropTypes.func.isRequired
  };

  static prepareAPI(uri) {
    if (!uri) {
      return null;
    }
    const uriData = new URL(uri);
    if (uriData.hostname !== 'github.com') {
      return null;
    }
    var [, owner, repo] = uriData.pathname.split('/', 3);
    if (repo.endsWith('.git')) {
      repo = repo.substr(0, repo.length - 4);
    }
    return {
      provider: uriData.hostname,
      requestEndpoint: `https://api.github.com/repos/${owner}/${repo}/releases`
    };
  }

  constructor() {
    super(...arguments);
    const api = RepositoryChangelog.prepareAPI(this.props.uri);
    if (api) {
      this.props.requestContent({ uri: api.requestEndpoint, cacheValid: '1h' });
    }
  }

  render() {
    const api = RepositoryChangelog.prepareAPI(this.props.uri);
    if (
      !this.props.uri ||
      !api ||
      (this.props.items && this.props.items.length === 0)
    ) {
      return (
        <ul className="background-message text-center">
          <li>No Information</li>
        </ul>
      );
    }
    return (
      <div>
        {this.props.items ? (
          <ReleaseNotes items={this.props.items} />
        ) : (
          <div className="text-center">
            <Spin tip="Loading..." size="large" />
          </div>
        )}
      </div>
    );
  }
}

class ReleaseNotes extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired
  };

  render() {
    const renderer = new marked.Renderer();
    renderer.link = function(href, title, text) {
      const link = marked.Renderer.prototype.link.call(this, href, title, text);
      return link.replace('<a', '<a target="_blank" ');
    };
    marked.setOptions({
      renderer: renderer
    });
    return (
      <div className="release-notes">
        <h2>Release Notes</h2>
        {this.props.items.map(item => (
          <div key={item.id}>
            <h3>
              <Tooltip title={item.tag_name}>{item.name || item.tag_name}</Tooltip>{' '}
              <small>
                released{' '}
                <Tooltip title={item.created_at}>
                  {humanize.relativeTime(new Date(item.created_at).getTime() / 1000)}
                </Tooltip>
              </small>
            </h3>
            <div dangerouslySetInnerHTML={{ __html: marked(item.body || '') }}></div>
          </div>
        ))}
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  const api = RepositoryChangelog.prepareAPI(ownProps.uri);
  if (!api) {
    return {};
  }
  const content = selectRequestedContent(state, api.requestEndpoint);
  return {
    items: content ? JSON.parse(content) : null
  };
}

export default connect(mapStateToProps, { requestContent })(RepositoryChangelog);
