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

import * as actions from '../actions';

import { Badge, Button, Spin } from 'antd';

import LibrarySearchCard from '../components/search-card';
import LibrarySearchForm from '../components/search-form';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { selectSearchResult } from '../selectors';

class LibrarySearchPage extends React.Component {
  static propTypes = {
    result: PropTypes.shape({
      items: PropTypes.array.isRequired,
      total: PropTypes.number.isRequired,
      page: PropTypes.number.isRequired,
      perpage: PropTypes.number.isRequired,
    }),
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    loadSearchResult: PropTypes.func.isRequired,
    searchQuery: PropTypes.string.isRequired,
    searchPage: PropTypes.number,
  };

  static STATUS = {
    LOADING: 0,
    LOADING_MORE: 1,
    NORESULTS: 2,
    LOADED: 3,
  };

  constructor() {
    super(...arguments);
    this._moreItems = [];
    this.props.loadSearchResult(this.props.searchQuery);
  }

  componentDidUpdate(prevProps) {
    const queryChanged = this.props.searchQuery !== prevProps.searchQuery;
    if (queryChanged || this.props.searchPage !== prevProps.searchPage) {
      if (queryChanged || !this.props.searchPage) {
        this._moreItems = [];
      }
      this.props.loadSearchResult(this.props.searchQuery, this.props.searchPage);
    }
  }

  onDidMoreResults() {
    this._moreItems = this._moreItems.concat(this.props.result.items);
    this.props.searchLibrary(this.props.searchQuery, this.props.result.page + 1);
  }

  hasMoreResults() {
    if (this.getStatus() === LibrarySearchPage.STATUS.LOADING_MORE) {
      return true;
    } else if (!this.props.result) {
      return false;
    }
    return this.props.result.page * this.props.result.perpage < this.props.result.total;
  }

  getStatus() {
    if (!this.props.result && this._moreItems.length) {
      return LibrarySearchPage.STATUS.LOADING_MORE;
    } else if (!this.props.result) {
      return LibrarySearchPage.STATUS.LOADING;
    } else if (this.props.result.items.length === 0) {
      return LibrarySearchPage.STATUS.NORESULTS;
    }
    return LibrarySearchPage.STATUS.LOADED;
  }

  getTotalResults() {
    if (this.props.result) {
      return this.props.result.total;
    }
    return -1;
  }

  render() {
    const status = this.getStatus();
    const totalResults = this.getTotalResults();

    let items = this.props.result ? this.props.result.items : [];
    if (this._moreItems.length) {
      items = this._moreItems.concat(items);
    }

    return (
      <div className="page-container">
        <LibrarySearchForm
          searchLibrary={this.props.searchLibrary}
          defaultSearch={this.props.searchQuery}
        />
        {totalResults > 0 && (
          <h1>
            Libraries <Badge overflowCount={100000} count={totalResults} />
          </h1>
        )}
        {status === LibrarySearchPage.STATUS.LOADING && (
          <div className="text-center">
            <Spin tip="Loading..." size="large" />
          </div>
        )}
        {status === LibrarySearchPage.STATUS.NORESULTS && (
          <ul className="background-message text-center">
            <li>No Results</li>
          </ul>
        )}
        <div className="block">
          {items.map((item) => (
            <LibrarySearchCard
              key={item.id}
              item={item}
              searchLibrary={this.props.searchLibrary}
              showLibrary={this.props.showLibrary}
            />
          ))}
        </div>
        {this.hasMoreResults() && (
          <div className="block text-center">
            <Button
              onClick={::this.onDidMoreResults}
              loading={status === LibrarySearchPage.STATUS.LOADING_MORE}
            >
              More...
            </Button>
          </div>
        )}
      </div>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    result: selectSearchResult(
      state,
      ownProps.location.state.query,
      ownProps.location.state.page
    ),
    searchQuery: ownProps.location.state.query,
    searchPage: ownProps.location.state.page,
    searchLibrary: (query, page) =>
      goTo(ownProps.history, '/libraries/registry/search', { query, page }),
    showLibrary: (idOrManifest) =>
      goTo(ownProps.history, '/libraries/registry/show', {
        idOrManifest,
      }),
  };
}

export default connect(mapStateToProps, actions)(LibrarySearchPage);
