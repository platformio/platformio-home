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

import { Badge, Icon, Spin } from 'antd';

import { LibraryStorage } from '../storage';
import LibraryStorageItem from './storage-item';
import PropTypes from 'prop-types';
import React from 'react';

export default class LibraryStorageItems extends React.Component {
  static propTypes = {
    item: PropTypes.instanceOf(LibraryStorage).isRequired,
    osRevealFile: PropTypes.func.isRequired,
    searchLibrary: PropTypes.func.isRequired,
    showLibrary: PropTypes.func.isRequired,
    uninstallLibrary: PropTypes.func.isRequired,
    updateLibrary: PropTypes.func.isRequired,
  };

  static status = {
    LOADING: 1,
    NORESULTS: 2,
    LOADED: 3,
  };

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

  onDidUninstallOrUpdateItem(item, action, onEnd) {
    (action === 'uninstall' ? this.props.uninstallLibrary : this.props.updateLibrary)(
      this.props.item,
      item,
      onEnd
    );
  }

  onDidReveal(e, dir) {
    e.stopPropagation();
    if (dir) {
      this.props.osRevealFile(dir);
    }
  }

  onDidToggleStorageList(e) {
    e.target.classList.toggle('anticon-up-circle-o');
    e.target.classList.toggle('anticon-down-circle-o');
    this.storageItemsPlacehodler.classList.toggle('hide');
  }

  renderBadge(items, status) {
    if (!items.length || status !== LibraryStorageItems.status.LOADED) {
      return null;
    }
    return <Badge count={items.length} />;
  }

  renderToggler(items) {
    if (!items.length) {
      return null;
    }
    return (
      <Icon
        type="up-circle-o"
        className="lib-storages-toggler"
        title="Show/Hide list of libraries"
        onClick={(e) => this.onDidToggleStorageList(e)}
      />
    );
  }

  render() {
    const status = this.getStatus();
    const items = this.getStorageItems();

    if (status === LibraryStorageItems.status.NORESULTS) {
      return null;
    }

    return (
      <div className="block lib-storage-items">
        <h2>
          <Icon type="folder" />{' '}
          <a onClick={(e) => this.onDidReveal(e, this.props.item.path)}>
            {this.props.item.name}
          </a>{' '}
          {this.renderBadge(items, status)} {this.renderToggler(items)}
        </h2>
        {status === LibraryStorageItems.status.LOADING && (
          <div className="text-center">
            <Spin tip="Loading..." size="large" />
          </div>
        )}
        {status === LibraryStorageItems.status.NORESULTS && (
          <div className="text-muted">No Results</div>
        )}
        <div ref={(item) => (this.storageItemsPlacehodler = item)}>
          {items.map((item) => (
            <LibraryStorageItem
              item={item}
              key={item.__pkg_dir}
              onShow={this.props.showLibrary}
              onReveal={(e) => this.onDidReveal(e, item.__pkg_dir)}
              onUninstall={(onEnd) =>
                this.onDidUninstallOrUpdateItem(item, 'uninstall', onEnd)
              }
              onUpdate={(onEnd) =>
                this.onDidUninstallOrUpdateItem(item, 'update', onEnd)
              }
              onSearch={this.props.searchLibrary}
              actions={this.props.item.actions}
            />
          ))}
        </div>
      </div>
    );
  }
}
