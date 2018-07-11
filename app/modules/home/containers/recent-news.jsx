/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as workspaceSettings from '../../../workspace/settings';

import { Card, Carousel, Col, Divider, Icon, Row, Spin, Tooltip } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import jsonrpc from 'jsonrpc-lite';
import { loadLatestTweets } from '../actions';
import { osOpenUrl } from '../../core/actions';
import { selectLatestTweets } from '../selectors';


class RecentNews extends React.Component {

  static propTypes = {
    items: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.instanceOf(jsonrpc.JsonRpcError)
    ]),
    loadLatestTweets: PropTypes.func.isRequired,
    osOpenUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    const twitterUrl = workspaceSettings.getUrl('twitter');
    this.props.loadLatestTweets(twitterUrl.substring(twitterUrl.lastIndexOf('/') + 1));
  }

  onClickItem(e, item) {
    e.preventDefault();
    if (item.entries.urls.length) {
      return this.props.osOpenUrl(item.entries.urls[0]);
    }
    return this.props.osOpenUrl(item.tweetUrl);
  }

  render() {
    return (
      <div className='recent-news'>
        <Divider>
          <a onClick={() => this.props.osOpenUrl(workspaceSettings.getUrl('twitter')) }>Recent News</a>
        </Divider>
        { this.renderCarousel() }
      </div>
      );
  }

  renderCarousel() {
    if (!this.props.items) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' />
        </div>
        );
    }
    else if (this.props.items instanceof jsonrpc.JsonRpcError) {
      return (
        <div className='text-center'>
          <Tooltip title={ this.props.items.message }>An error occurred loading the latest news. Try again later. <Icon type='info-circle-o' /></Tooltip>
        </div>
        );
    }
    return (
      <Carousel className='block' autoplay autoplaySpeed={ 10000 }>
        { [...Array(Math.ceil(this.props.items.length / 3)).keys()].map(rowNum => (
            <div key={ rowNum }>
              <Row gutter={ 18 }>
                <Col span={ 8 }>
                  { this.renderCard(rowNum * 3) }
                </Col>
                <Col span={ 8 }>
                  { this.renderCard(rowNum * 3 + 1) }
                </Col>
                <Col span={ 8 }>
                  { this.renderCard(rowNum * 3 + 2) }
                </Col>
              </Row>
            </div>
          )) }
      </Carousel>
      );
  }

  renderCard(itemIndex) {
    if (itemIndex >= this.props.items.length) {
      return null;
    }
    const item = this.props.items[itemIndex];
    let coverUrl = workspaceSettings.get('companyLogoSrc');
    if (item.entries.photos.length) {
      coverUrl = item.entries.photos[0];
    }
    const title = (
    <ul className='list-inline'>
      { item.isPinned && (
        <li>
          <Icon type='pushpin' title='Pinned news' />
        </li>
      )}
      <li>
        { item.timeFormatted }
      </li>
      <li>
        <Icon type='twitter' />
      </li>
      <li>
        { item.author }
      </li>
    </ul>);
    const cover = <div style={ { backgroundImage: `url(${ coverUrl })` } } />;
    return (
      <Card hoverable cover={ cover } onClick={ e => this.onClickItem(e, item) }>
        <Card.Meta title={ title } description={ <span dangerouslySetInnerHTML={ { __html: item.text } } /> } />
      </Card>
      );
  }
}

// Redux

function mapStateToProps(state) {
  return {
    items: selectLatestTweets(state)
  };
}

export default connect(mapStateToProps, {
  loadLatestTweets,
  osOpenUrl
})(RecentNews);
