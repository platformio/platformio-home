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

import { Button, Input, Modal, Table } from 'antd';

import { DocumentationLink } from '@project/containers/documentation-link';
import PropTypes from 'prop-types';
import React from 'react';
import { SchemaType } from '@project/types';
import { getDocumentationUrl } from '@project/helpers';

const GROUP_ALREADY_ADDED = 'Already Added';

export class ManageSectionOptionsModal extends React.Component {
  static propTypes = {
    // data
    // extraCallbackArgs: PropTypes.array,
    initialOptions: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    schema: SchemaType,
    sectionName: PropTypes.string,
    visible: PropTypes.bool,
    // callbacks
    onClose: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = this.getInitialStateFromProps(props);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      this.setState(this.getInitialStateFromProps(this.props));
    }
  }

  getInitialStateFromProps(props) {
    // Reset filter and selection on show
    return {
      search: undefined,
      selectedKeys: [...props.initialOptions, this.getGroupKey(GROUP_ALREADY_ADDED)]
    };
  }

  getOptionGroup(item) {
    return this.props.initialOptions.includes(item.name)
      ? GROUP_ALREADY_ADDED
      : item.group;
  }

  getGroupKey(groupName) {
    return `group:${groupName}`;
  }

  isGroupKey(key) {
    return key.startsWith('group:');
  }

  getGroupOptions(group) {
    return this.props.schema
      .filter(x => this.getOptionGroup(x) === group)
      .map(x => x.name);
  }

  isAllGroupOptionsSelected(group, selection) {
    if (!selection) {
      selection = this.state.selectedKeys;
    }
    const groupItems = this.getGroupOptions(group);
    return groupItems.length && groupItems.every(name => selection.includes(name));
  }

  getDiff() {
    return {
      add: this.state.selectedKeys.filter(
        name => !this.isGroupKey(name) && !this.props.initialOptions.includes(name)
      ),
      remove: this.props.initialOptions.filter(
        name => !this.state.selectedKeys.includes(name)
      )
    };
  }

  getRowAttrs = record => ({
    onClick: () => {
      if (record.name) {
        this.toggleOption(record.name);
      } else {
        this.toggleGroup(this.getOptionGroup(record));
      }
    }
  });

  getTableColumns() {
    return [
      {
        className: 'col-name',
        title: 'Name',
        dataIndex: 'name',
        render: (name, record) => (
          <React.Fragment>
            {record.group !== GROUP_ALREADY_ADDED && (
              <React.Fragment>
                <DocumentationLink
                  url={getDocumentationUrl(
                    record.scope || record.children[0].scope,
                    record.group,
                    record.name
                  )}
                />{' '}
              </React.Fragment>
            )}
            <span>
              {name
                ? name
                : `${record.group[0].toUpperCase()}${record.group.substr(1)} Options`}
            </span>
          </React.Fragment>
        )
      },
      {
        title: 'Description',
        dataIndex: 'description',
        render: (description, record) => (
          <small style={{ lineHeight: 1 }}>
            {description && `${description}.`}
            {this.renderDefault(record)}
          </small>
        )
      }
    ];
  }

  _toggleOption(name, oldSelectedKeys) {
    let selectedKeys;
    if (!this.state.selectedKeys.includes(name)) {
      selectedKeys = [...oldSelectedKeys, name];
    } else {
      selectedKeys = oldSelectedKeys.filter(x => x !== name);
    }
    const group = this.getOptionGroup(this.props.schema.find(s => s.name === name));
    const groupSelected = this.isAllGroupOptionsSelected(group, selectedKeys);
    return this._toggleGroup(group, selectedKeys, groupSelected, false);
  }

  toggleOption(name) {
    this.setState(oldState => ({
      selectedKeys: this._toggleOption(name, oldState.selectedKeys)
    }));
  }

  _toggleGroup(group, oldSelectedKeys, forceSelected, toggleOptions = true) {
    const groupItems = toggleOptions ? this.getGroupOptions(group) : [];
    const groupSelected =
      forceSelected !== undefined
        ? !forceSelected
        : this.isAllGroupOptionsSelected(group);

    if (!groupSelected) {
      return [...new Set([...oldSelectedKeys, ...groupItems, this.getGroupKey(group)])];
    }
    return oldSelectedKeys.filter(
      key => !groupItems.includes(key) && key !== this.getGroupKey(group)
    );
  }

  toggleGroup(group) {
    this.setState(oldState => ({
      selectedKeys: this._toggleGroup(group, oldState.selectedKeys)
    }));
  }

  handleApplyClick = () => {
    this.props.onClose({
      ...this.getDiff(),
      sectionName: this.props.sectionName
    });
  };

  handleCancelClick = () => {
    this.props.onClose();
  };

  handleTableRowSelect = record => {
    if (!record.name) {
      this.toggleGroup(this.getOptionGroup(record));
    } else {
      this.toggleOption(record.name);
    }
  };

  handleFilterChange = e => {
    this.setState({ search: e.target.value });
  };

  handleFilterSearch = search => {
    this.setState({ search });
  };

  renderDefault(record) {
    return (
      record.name &&
      record.default != undefined && (
        <React.Fragment>
          {' '}
          Default is{' '}
          <code>
            {record.default != undefined
              ? Array.isArray(record.default)
                ? record.default.join('\n')
                : record.default.toString()
              : '<none>'}
          </code>
        </React.Fragment>
      )
    );
  }

  renderFooter() {
    const diff = this.getDiff();
    const diffStrings = [];
    if (diff.add.length) {
      diffStrings.push(`add ${diff.add.length}`);
    }
    if (diff.remove.length) {
      diffStrings.push(`remove ${diff.remove.length}`);
    }
    return [
      <Button key="cancel" size="large" onClick={this.handleCancelClick}>
        Cancel
      </Button>,
      <Button
        key="submit"
        type="primary"
        size="large"
        disabled={!this.state.selectedKeys.length}
        onClick={this.handleApplyClick}
      >
        Apply
        {diffStrings.length !== 0 && (
          <React.Fragment>
            {' '}
            <small>({diffStrings.join(' and ')})</small>
          </React.Fragment>
        )}
      </Button>
    ];
  }

  render() {
    const groups = new Set();
    const itemsByGroup = {};
    const items = this.props.schema || [];

    const searchFilter = name =>
      name.includes(this.state.search) ||
      (this.props.schema[name] &&
        this.props.schema[name].description &&
        this.props.schema[name].description
          .toLowerCase()
          .includes(this.state.search.toLowerCase()));

    const filteredItems =
      this.state.search && this.state.search.length
        ? items.filter(x => searchFilter(x.name))
        : items;

    for (const item of filteredItems) {
      const group = this.getOptionGroup(item);

      if (!groups.has(group)) {
        groups.add(group);
        itemsByGroup[group] = [];
      }
      itemsByGroup[group].push({ ...item, id: item.name });
    }

    const ds = [...groups].map(group => ({
      group,
      id: this.getGroupKey(group),
      children: itemsByGroup[group]
    }));

    return (
      <Modal
        visible={this.props.visible}
        className="project-config-add-option-modal"
        width={800}
        title={`Manage Options of Section "${this.props.sectionName}"`}
        onCancel={this.handleCancelClick}
        footer={this.renderFooter()}
      >
        <div className="block">
          <Input.Search
            allowClear
            placeholder="Search settings"
            onChange={this.handleFilterChange}
            onSearch={this.handleFilterSearch}
            style={{ width: '100%' }}
            value={this.state.search}
          />
        </div>
        <div className="scrollable">
          <Table
            columns={this.getTableColumns()}
            dataSource={ds}
            defaultExpandedRowKeys={
              this.props.schema && [
                ...new Set(
                  this.props.schema
                    .filter(s => this.props.initialOptions.includes(s.name))
                    .map(s => this.getGroupKey(this.getOptionGroup(s)))
                )
              ]
            }
            expandedRowRender={this.renderExpandedRow}
            onRow={this.getRowAttrs}
            pagination={false}
            rowKey="id"
            rowSelection={{
              onSelect: this.handleTableRowSelect,
              selectedRowKeys: this.state.selectedKeys,
              columnWidth: 32
            }}
            size="small"
          />
        </div>
      </Modal>
    );
  }
}
