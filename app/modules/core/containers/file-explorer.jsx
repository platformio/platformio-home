/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';
import * as path from '../path';
import * as selectors from '../selectors';

import { Breadcrumb, Button, Col, Icon, Input, Row, Spin } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { selectStorageItem } from '../../../store/selectors';


class FileExplorer extends React.Component {

  static propTypes = {
    ask: PropTypes.string,
    onSelect: PropTypes.func,

    disks: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      disk: PropTypes.string
    })),
    osDirItems: PropTypes.object,
    homeDir: PropTypes.string,
    projectsDir: PropTypes.string,
    favoriteFolders: PropTypes.arrayOf(PropTypes.string),

    listLogicalDisks: PropTypes.func.isRequired,
    osListDir: PropTypes.func.isRequired,
    osMakeDirs: PropTypes.func.isRequired,
    osRevealFile: PropTypes.func.isRequired,
    osCopyFile: PropTypes.func.isRequired,
    osRenameFile: PropTypes.func.isRequired,
    resetFSItems: PropTypes.func.isRequired,
    toggleFavoriteFolder: PropTypes.func.isRequired
  }

  static defaultProps = {
    ask: 'directory',
    onSelect: () => {
    }
  }

  constructor() {
    super(...arguments);
    this.state = {
      showHidden: false,
      pendingMakeDirs: false,
      pendingRenameFile: false,
      rootDir: null
    };
  }

  componentWillMount() {
    this.props.listLogicalDisks();
  }

  onDidRefresh() {
    this.props.resetFSItems();
    if (this.state.rootDir) {
      this.onDidChangeRoot(this.state.rootDir);
    }
  }

  onDidToggleHidden() {
    this.setState({
      showHidden: !this.state.showHidden
    });
  }

  onDidToggleFavorite() {
    this.props.toggleFavoriteFolder(this.state.rootDir);
  }

  onRequestCreateFolder() {
    this.setState({
      pendingMakeDirs: !this.state.pendingMakeDirs,
      pendingRenameFile: false
    });
  }

  onRequestRenameFile() {
    this.setState({
      pendingRenameFile: !this.state.pendingRenameFile,
      pendingMakeDirs: false
    });
  }

  onDidMakeDirs(e) {
    const newDir = path.join(this.state.rootDir, e.target.value);
    this.props.osMakeDirs(newDir);
    this.props.resetFSItems();
    this.onDidChangeRoot(newDir);
  }

  onDidRenameFile(e) {
    const newDir = path.join(path.dirname(this.state.rootDir), e.target.value);
    this.props.osRenameFile(this.state.rootDir, newDir);
    this.props.resetFSItems();
    this.onDidChangeRoot(newDir);
  }

  onDidDuplicate() {
    const newDir = this.state.rootDir + ' copy';
    this.props.osCopyFile(this.state.rootDir, newDir);
    this.props.resetFSItems();
    this.onDidChangeRoot(newDir);
  }

  onDidChangeRoot(rootDir) {
    this.setState({
      rootDir,
      pendingMakeDirs: false,
      pendingRenameFile: false
    });
    this.props.osListDir(rootDir);
    if (this.props.ask === 'directory') {
      this.onDidSelectItem(rootDir);
    }
  }

  onDidSelectItem(item) {
    return this.props.onSelect(item);
  }

  getRootItems() {
    if (!this.props.disks) {
      return null;
    } else if (this.state.rootDir && (!this.props.osDirItems || !this.props.osDirItems.hasOwnProperty(this.state.rootDir))) {
      return null;
    }

    if (!this.state.rootDir) {
      return this.props.disks.map(item => ({
        name: item.name || item.disk,
        path: item.disk,
        isDir: true
      }));
    }

    return this.props.osDirItems[this.state.rootDir].map(([name, isDir]) => ({
      name,
      isDir,
      path: path.join(this.state.rootDir, name)
    }));
  }

  filterHidden(filename) {
    return this.state.showHidden || !filename.startsWith('.');
  }

  render() {
    if (!this.props.disks) {
      return (
        <div className='text-center' style={ { marginTop: '25px' } }>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }

    return (
      <div className='file-explorer'>
        { this.renderToolbar() }
        <Row>
          <Col xs={ 6 } className='fe-sidebar'>
            { this.renderSidebar() }
          </Col>
          <Col xs={ 18 } className='fe-tree'>
            { this.renderBreadcrumb() }
            { this.renderRootItems() }
          </Col>
        </Row>
        { (this.state.pendingMakeDirs || this.state.pendingRenameFile) &&
          <Row>
            <Col xs={ 6 }></Col>
            <Col xs={ 18 }>
              { this.state.pendingMakeDirs ? (
                <Input placeholder='Folder Name' onPressEnter={ ::this.onDidMakeDirs } ref={ elm => elm ? elm.focus() : '' } />
                ) : (
                <Input defaultValue={ path.basename(this.state.rootDir) } onPressEnter={ ::this.onDidRenameFile } ref={ elm => elm ? elm.focus() : '' } />
                ) }
            </Col>
          </Row> }
      </div>
      );
  }

  renderToolbar() {
    return (
      <div className='fe-toolbar'>
        <Button.Group className='inline-block'>
          <Button icon='reload' title='Refresh' onClick={ ::this.onDidRefresh }></Button>
          <Button icon={ this.state.rootDir && (this.props.favoriteFolders || []).includes(this.state.rootDir) ? 'star' : 'star-o' }
            title='Toggle favorite folder'
            disabled={ !this.state.rootDir }
            onClick={ ::this.onDidToggleFavorite }></Button>
          <Button icon='eye'
            title='Show hidden files'
            ghost={ this.state.showHidden }
            type={ this.state.showHidden ? 'primary' : 'default' }
            onClick={ ::this.onDidToggleHidden }></Button>
        </Button.Group>
        <Button.Group className='inline-block'>
          <Button icon='folder-add'
            title='New folder'
            disabled={ !this.state.rootDir }
            type={ this.state.pendingMakeDirs ? 'danger' : 'default' }
            onClick={ ::this.onRequestCreateFolder }>
            { this.state.pendingMakeDirs ? 'Cancel' : 'New' }
          </Button>
          <Button icon='edit'
            title='Rename'
            disabled={ !this.state.rootDir }
            type={ this.state.pendingRenameFile ? 'danger' : 'default' }
            onClick={ ::this.onRequestRenameFile }>
            { this.state.pendingRenameFile ? 'Cancel' : 'Rename' }
          </Button>
        </Button.Group>
        <Button.Group className='inline-block'>
          <Button icon='copy'
            title='Duplicate'
            disabled={ !this.state.rootDir }
            onClick={ ::this.onDidDuplicate }>
            Duplicate
          </Button>
          <Button icon='folder-open'
            title='Reveal'
            disabled={ !this.state.rootDir }
            onClick={ () => this.props.osRevealFile(this.state.rootDir) }>
            Reveal
          </Button>
        </Button.Group>
      </div>
      );
  }

  renderBreadcrumb() {
    if (!this.state.rootDir) {
      return;
    }
    const routes = [];
    let lastPath = this.state.rootDir;
    while (lastPath) {
      routes.push({
        path: lastPath,
        name: path.basename(lastPath)
      });
      const parent = path.dirname(lastPath);
      if (!parent || parent === lastPath) {
        break;
      }
      lastPath = (parent && parent !== lastPath) ? parent : null;
    }

    const itemRender = (route, params, routes) => {
      if (routes[routes.length - 1].path === route.path) {
        return <span>{ route.name }</span>;
      }
      return <a onClick={ () => this.onDidChangeRoot(route.path) }>
               { route.name }
             </a>;
    };
    return <Breadcrumb itemRender={ itemRender } routes={ routes.reverse() } />;
  }

  renderSidebar() {
    return (
      <div>
        { this.renderSiderbarFavorites() }
        <b>Places</b>
        <ul className='block'>
          <li>
            <Icon type='home' />
            <a onClick={ () => this.onDidChangeRoot(this.props.homeDir) } title={ this.props.homeDir }>
              { path.basename(this.props.homeDir) }
            </a>
          </li>
          <li>
            <Icon type='book' /><a onClick={ () => this.onDidChangeRoot(this.props.projectsDir) } title={ this.props.projectsDir }>Projects</a>
          </li>
        </ul>
        <b>Devices</b>
        <ul>
          { this.props.disks.map(item => (
              <li key={ item.disk }>
                <Icon type='hdd' />
                <a onClick={ () => this.onDidChangeRoot(item.disk) }>
                  { item.name || item.disk }
                </a>
              </li>
            )) }
        </ul>
      </div>
      );
  }

  renderSiderbarFavorites() {
    const items = this.props.favoriteFolders || [];
    let content = '';
    if (!items || !items.length) {
      content = <div>
                  <small>Use <Icon type='star-o' /> to add folder</small>
                </div>;
    } else {
      content = (
        <ul>
          { items.map(item => (
              <li key={ item }>
                <Icon type='star-o' />
                <a onClick={ () => this.onDidChangeRoot(item) } title={ item }>
                  { path.basename(item) }
                </a>
              </li>
            )) }
        </ul>
      );
    }
    return (
      <div className='block'>
        <b>Favorites</b>
        { content }
      </div>
      );
  }

  renderRootItems() {
    const items = this.getRootItems();
    if (!items) {
      return (
        <div className='text-center' style={ { marginTop: '25px' } }>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    } else if (!items.length) {
      return (
        <ul className='background-message text-center' style={ { marginTop: '25px' } }>
          <li>
            No Items
          </li>
        </ul>
        );
    }
    return (
      <div className='fe-root-items'>
        <ul>
          { items.filter(item => this.filterHidden(item.name)).map(item => (
              <li key={ item.path }>
                { this.renderRootItem(item) }
              </li>
            )) }
        </ul>
      </div>
      );
  }

  renderRootItem(item) {
    const itemIcon = <Icon type={ item.isDir ? 'folder' : 'file' } />;
    if (item.isDir) {
      return <span>{ itemIcon } <a onClick={ () => this.onDidChangeRoot(item.path) }>{ item.name }</a></span>;
    } else if (this.props.ask !== 'directory') {
      return <span>{ itemIcon } <a onClick={ () => this.onDidSelectItem(item.path) }>{ item.name }</a></span>;
    }
    return <span>{ itemIcon } { item.name }</span>;
  }

}

// Redux

function mapStateToProps(state) {
  return {
    disks: selectors.selectLogicalDisks(state),
    osDirItems: selectors.selectOsDirItems(state),
    homeDir: selectStorageItem(state, 'homeDir'),
    projectsDir: selectStorageItem(state, 'projectsDir'),
    favoriteFolders: selectStorageItem(state, 'favoriteFolders')
  };
}

export default connect(mapStateToProps, actions)(FileExplorer);
