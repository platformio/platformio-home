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

export class AddSectionOptionModal extends React.Component {
  static propTypes = {
    // data
    // extraCallbackArgs: PropTypes.array,
    schema: SchemaType,
    sectionName: PropTypes.string,
    visible: PropTypes.bool,
    // callbacks
    onClose: PropTypes.func.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      search: undefined,
      selectedKeys: []
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      // Reset filter and selection on show
      this.setState({ search: undefined, selectedKeys: [] });
    }
  }

  getRowAttrs = record => ({
    onClick: () => {
      if (record.name) {
        this.selectOption(record.name);
      } else {
        this.selectGroup(record.group);
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
            <DocumentationLink
              url={getDocumentationUrl(
                record.scope || record.children[0].scope,
                record.group,
                record.name
              )}
            />{' '}
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
        render: description => <small style={{ lineHeight: 1 }}>{description}</small>
      },
      {
        title: 'Default',
        dataIndex: 'default',
        render: value =>
          value != undefined
            ? Array.isArray(value)
              ? value.join('\n')
              : value
            : '<none>'
      }
    ];
  }

  selectOption(name) {
    if (!this.state.selectedKeys.includes(name)) {
      this.setState(oldState => ({
        selectedKeys: [...oldState.selectedKeys, name]
      }));
    } else {
      this.setState(oldState => ({
        selectedKeys: oldState.selectedKeys.filter(x => x !== name)
      }));
    }
  }

  selectGroup(group) {
    const groupItems = this.props.schema
      .filter(x => x.group === group)
      .map(x => x.name);
    const groupSelected =
      groupItems.length &&
      groupItems.every(name => this.state.selectedKeys.includes(name));

    if (!groupSelected) {
      this.setState(oldState => ({
        selectedKeys: [...new Set([...oldState.selectedKeys, ...groupItems])]
      }));
    } else {
      this.setState(oldState => ({
        selectedKeys: oldState.selectedKeys.filter(x => !groupItems.includes(x))
      }));
    }
  }

  handleAddClick = () => {
    this.props.onClose({
      names: this.state.selectedKeys.filter(x => !x.startsWith('group:')),
      section: this.props.sectionName
    });
  };

  handleCancelClick = () => {
    this.props.onClose();
  };

  handleSelectionChange = rowKeys => {
    this.setState({
      selectedKeys: rowKeys
    });
  };

  handleFilterChange = e => {
    this.setState({ search: e.target.value });
  };

  handleFilterSearch = search => {
    this.setState({ search });
  };

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
      if (!groups.has(item.group)) {
        groups.add(item.group);
        itemsByGroup[item.group] = [];
      }
      itemsByGroup[item.group].push({ ...item, id: item.name });
    }

    const ds = [...groups].map(group => ({
      group,
      id: `group:${group}`,
      children: itemsByGroup[group]
    }));

    return (
      <Modal
        visible={this.props.visible}
        className="project-config-add-option-modal"
        width={600}
        title={`Add Option(s) into Section "${this.props.sectionName}"`}
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
            expandedRowRender={this.renderExpandedRow}
            onRow={this.getRowAttrs}
            pagination={false}
            rowKey="id"
            rowSelection={{
              onChange: this.handleSelectionChange,
              selectedRowKeys: this.state.selectedKeys,
              columnWidth: 32
            }}
            size="small"
          />
        </div>
      </Modal>
    );
  }

  renderFooter() {
    return [
      <Button key="cancel" size="large" onClick={this.handleCancelClick}>
        Cancel
      </Button>,
      <Button
        key="submit"
        type="primary"
        size="large"
        disabled={!this.state.selectedKeys.length}
        onClick={this.handleAddClick}
      >
        Add Selected
      </Button>
    ];
  }
}
