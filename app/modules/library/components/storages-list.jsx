/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Input, Spin } from 'antd';

import { LibraryStorage } from '../storage';
import LibraryStorageItems from './storage-items';
import PropTypes from 'prop-types';
import React from 'react';


export default class LibraryStoragesList extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.instanceOf(LibraryStorage).isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    uninstallLibrary: PropTypes.func.isRequired,
    updateLibrary: PropTypes.func.isRequired
  }

  componentDidMount() {
    if (this._searchInputElement) {
      this._searchInputElement.focus();
    }
  }

  onDidFilter(value) {
    this.props.setFilter(value);
  }

  render() {
    if (!this.props.items) {
      return (
        <div className='text-center'>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }
    if (!this.props.items.length) {
      return (
        <ul className='background-message text-center'>
          <li>
            No Results
          </li>
        </ul>
        );
    }
    return (
      <div className='lib-storages-list'>
        <Input className='block input-search-lg'
          placeholder='Filter libraries by name'
          defaultValue={ this.props.filterValue }
          size='large'
          onChange={ e => this.onDidFilter(e.target.value) }
          ref={ elm => this._searchInputElement = elm } />
        <div>
          { this.props.items.map(item => (
              <LibraryStorageItems item={ item }
                key={ item.name }
                osRevealFile={ this.props.osRevealFile }
                searchLibrary={ this.props.searchLibrary }
                showLibrary={ this.props.showLibrary }
                uninstallLibrary={ this.props.uninstallLibrary }
                updateLibrary={ this.props.updateLibrary } />
            )) }
        </div>
      </div>
      );
  }

}
