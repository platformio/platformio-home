/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Badge, Icon, Spin } from 'antd';

import { LibraryStorage } from '../storage';
import LibraryStorageItem from './storage-item';
import PropTypes from 'prop-types';
import React from 'react';


export default class LibraryStorageItems extends React.Component {

  static propTypes = {
    item: PropTypes.instanceOf(LibraryStorage).isRequired,
    revealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    uninstallLibrary: PropTypes.func.isRequired,
    updateLibrary: PropTypes.func.isRequired,
  }

  static status = {
    LOADING: 1,
    NORESULTS: 2,
    LOADED: 3
  }

  getStatus() {
    if (this.props.item.items === undefined) {
      return LibraryStorageItems.status.LOADING;
    } else if (!this.props.item.items.length) {
      return LibraryStorageItems.status.NORESULTS;
    }
    return LibraryStorageItems.status.LOADED;
  }

  getStorageItems() {
    if (this.getStatus() !== LibraryStorageItems.status.LOADED) {
      return [];
    }
    return this.props.item.items;
  }

  onDidUninstallOrUpdateItem(item, cmd, onEnd) {
    (cmd === 'uninstall' ? this.props.uninstallLibrary : this.props.updateLibrary)(
      this.props.item.path,
      item.__pkg_dir,
      onEnd
    );
  }

  onDidReveal(e, dir) {
    e.stopPropagation();
    if (dir) {
      this.props.revealFile(dir);
    }
  }

  onDidToggleStorageList(e) {
    e.target.classList.toggle('anticon-up-circle-o');
    e.target.classList.toggle('anticon-down-circle-o');
    this.storageItemsPlacehodler.classList.toggle('hide');
  }

  renderBadge(items, status) {
    if (!items.length || status !== LibraryStorageItems.status.LOADED) {
      return;
    }
    return <Badge count={ items.length } />;
  }

  renderToggler(items) {
    if (!items.length) {
      return;
    }
    return (
      <Icon type='up-circle-o'
        className='lib-storages-toggler'
        title='Show/Hide list of libraries'
        onClick={ (e) => this.onDidToggleStorageList(e) } />
      );
  }

  render() {
    const status = this.getStatus();
    const items = this.getStorageItems();

    if (status === LibraryStorageItems.status.NORESULTS) {
      return null;
    }

    return (
      <div className='lib-storage-items'>
        <h2><Icon type='folder' /> <a onClick={ (e) => this.onDidReveal(e, this.props.item.path) }>{ this.props.item.name }</a> { this.renderBadge(items, status) } { this.renderToggler(items) }</h2>
        { status === LibraryStorageItems.status.LOADING &&
          <div className='text-center'>
            <Spin tip='Loading...' size='large' />
          </div> }
        { status === LibraryStorageItems.status.NORESULTS &&
          <div className='text-muted'>
            No Results
          </div> }
        <div ref={ item => this.storageItemsPlacehodler = item }>
          { items.map(item => (
              <LibraryStorageItem item={ item }
                key={ item.__pkg_dir }
                onShow={ this.props.showLibrary }
                onReveal={ (e) => this.onDidReveal(e, item.__pkg_dir) }
                onUninstall={ onEnd => this.onDidUninstallOrUpdateItem(item, 'uninstall', onEnd) }
                onUpdate={ onEnd => this.onDidUninstallOrUpdateItem(item, 'update', onEnd) }
                onSearch={ this.props.searchLibrary }
                actions={ this.props.item.actions } />
            )) }
        </div>
      </div>
      );
  }
}
