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

import { Button, Col, Icon, Row, Spin, Tree } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { selectStorageItem } from '../../../store/selectors';


class FileExplorer extends React.Component {

  static propTypes = {
    pick: PropTypes.string,
    multiple: PropTypes.bool,
    onSelect: PropTypes.func,

    disks: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      disk: PropTypes.string
    })),
    dirItems: PropTypes.object,
    homeDir: PropTypes.string,
    projectsDir: PropTypes.string,

    listLogicalDisks: PropTypes.func.isRequired,
    listDir: PropTypes.func.isRequired,
    resetFSItems: PropTypes.func.isRequired
  }

  static defaultProps = {
    pick: 'folder',
    multiple: false,
    onSelect: () => {
    }
  }

  constructor() {
    super(...arguments);
    this.state = {
      showHidden: false,
      rootDir: null
    };
  }

  componentWillMount() {
    this.props.listLogicalDisks();
  }

  onDidUp() {
    this.onDidChangeRoot(path.dirname(this.state.rootDir));
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

  onDidChangeRoot(rootDir) {
    this.setState({
      rootDir
    });
    this.props.listDir(rootDir);
  }

  onDidSelect(items) {
    if (!items.length) {
      return this.props.onSelect(null);
    }
    return this.props.onSelect(this.props.multiple ? items : items[0]);
  }

  onDidLoad(treeNode) {
    this.props.listDir(treeNode.props.eventKey);
    return Promise.resolve(true);
  }

  getRootItems() {
    if (!this.props.disks) {
      return null;
    } else if (this.state.rootDir && (!this.props.dirItems || !this.props.dirItems.hasOwnProperty(this.state.rootDir))) {
      return null;
    }

    if (!this.state.rootDir) {
      return this.props.disks.map(item => ({
        name: item.name || item.disk,
        path: item.disk,
        isDir: true
      }));
    }

    return this.props.dirItems[this.state.rootDir].map(([name, isDir]) => ({
      name,
      isDir,
      path: path.join(this.state.rootDir, name)
    }));
  }

  filterHidden(filename) {
    return this.state.showHidden || !filename.startsWith('.');
  }

  isNodeDisabled(isDir) {
    return (this.props.pick === 'folder' && !isDir) || (this.props.pick !== 'folder' && isDir);
  }

  render() {
    if (!this.props.disks) {
      return (
        <div className='text-center' style={ { marginTop: '25px' } }>
          <Spin tip='Loading...' size='large' />
        </div>
        );
    }

    const rootItems = this.getRootItems();
    return (
      <Row className='file-explorer'>
        <Col xs={ 6 } className='fe-sidebar'>
          { this.renderSidebar() }
        </Col>
        <Col xs={ 18 } className='fe-tree'>
          { rootItems ? (
            this.renderRootNode(rootItems)
            ) : (
            <div className='text-center' style={ { marginTop: '25px' } }>
              <Spin tip='Loading...' size='large' />
            </div>
            ) }
        </Col>
      </Row>
      );
  }

  renderSidebar() {
    return (
      <div>
        <div className='fe-toolbar'>
          <Button.Group>
            <Button icon='arrow-up'
              title='Enclosing Folder'
              disabled={ !this.state.rootDir }
              onClick={ ::this.onDidUp }></Button>
            <Button icon='reload' title='Refresh' onClick={ ::this.onDidRefresh }></Button>
            <Button icon='eye'
              title='Show hidden files'
              ghost={ this.state.showHidden }
              type={ this.state.showHidden ? 'primary' : 'default' }
              onClick={ ::this.onDidToggleHidden }></Button>
          </Button.Group>
        </div>
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

  renderRootNode(items) {
    if (!items.length) {
      return (
        <ul className='background-message text-center' style={ { marginTop: '25px' } }>
          <li>
            No Items
          </li>
        </ul>
        );
    }
    return (
      <Tree showLine={ true }
        multiple={ this.props.multiple }
        onSelect={ ::this.onDidSelect }
        loadData={ ::this.onDidLoad }>
        { items.filter(item => this.filterHidden(item.name)).map(item => (
            <Tree.TreeNode title={ item.name }
              key={ item.path }
              isLeaf={ !item.isDir }
              disabled={ this.isNodeDisabled(item.isDir) }>
              { this.renderDirNodes(item.path) }
            </Tree.TreeNode>
          )) }
      </Tree>
      );
  }

  renderDirNodes(dirPath) {
    if (!this.props.dirItems || !this.props.dirItems.hasOwnProperty(dirPath)) {
      return null;
    }
    {
      return this.props.dirItems[dirPath].filter(item => this.filterHidden(item[0])).map(([name, isDir]) => isDir ? (
        <Tree.TreeNode title={ name }
          key={ path.join(dirPath, name) }
          isLeaf={ false }
          disabled={ this.isNodeDisabled(true) }>
          { this.renderDirNodes(path.join(dirPath, name)) }
        </Tree.TreeNode>
        ) : (
        <Tree.TreeNode title={ name }
          key={ path.join(dirPath, name) }
          isLeaf={ true }
          disabled={ this.isNodeDisabled(false) } />
        )
      );
    }
  }
}

// Redux

function mapStateToProps(state) {
  return {
    disks: selectors.selectLogicalDisks(state),
    dirItems: selectors.selectDirItems(state),
    homeDir: selectStorageItem(state, 'homeDir'),
    projectsDir: selectStorageItem(state, 'projectsDir')
  };
}

export default connect(mapStateToProps, actions)(FileExplorer);
