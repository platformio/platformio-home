/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Alert, Icon, Table } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { cmpSort } from '../../core/helpers';


export default class PlatformDetailPackages extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      type: PropTypes.string,
      requirements: PropTypes.string,
      version: PropTypes.string,
      originalVersion: PropTypes.string,
      url: PropTypes.string,
      optional: PropTypes.bool
    })),
    openUrl: PropTypes.func.isRequired,
    showInstalledPlatforms: PropTypes.func.isRequired
  }

  getTableColumns(extended) {
    let columns = [
      {
        title: 'Name',
        key: 'name',
        render: (_, record) => (
          <span>{ record.url ? (
        <a onClick={ () => this.props.openUrl(record.url) }>
          { record.name }
        </a>
        ) : (
        record.name) }</span>
        )
      }
    ];
    if (extended) {
      columns = columns.concat([
        {
          title: 'Type',
          dataIndex: 'type'
        },
        {
          title: 'Optional',
          key: 'optional',
          render: (_, record) => <Icon type={ record.optional ? 'check' : '' } />
        },
        {
          title: 'Requirements',
          dataIndex: 'requirements'
        },
        {
          title: 'Installed',
          key: 'installed',
          render: (_, record) => (
            <span>{ record.version } { record.originalVersion && (
                           <span>{ ' ' }({ record.originalVersion })</span>
                           ) }</span>
          )
        }
      ]);
      return columns;
    }
    columns = columns.concat([
      {
        title: 'Description',
        dataIndex: 'description'
      }
    ]);
    return columns;
  }

  render() {
    if (!this.props.items || this.props.items.length === 0) {
      return null;
    }
    const extended = this.props.items[0].requirements ? true : false;
    return (
      <div>
        <Alert className='block' showIcon message={ this.renderNotifications(extended) } />
        { this.renderTable(extended) }
      </div>);
  }

  renderNotifications(extended) {
    return (
      <div>
        { extended ? (
          <div>
           Optional packages will be installed automatically depending on a build environment.
          </div>
          ) : (
          <div>
           More detailed information about package requirements and installed versions is available for the <a onClick={ () => this.props.showInstalledPlatforms() }>installed platforms</a>.
          </div>
          ) }
      </div>);
  }

  renderTable(extended) {
    let data = this.props.items;
    data = data.sort((a, b) => cmpSort(a.name.toUpperCase(), b.name.toUpperCase()));
    if (extended) {
      return (
        <Table rowKey='name'
          pagination={ false }
          dataSource={ data }
          columns={ this.getTableColumns(extended) }
          expandedRowRender={ ::this.renderExpandedRow } />);
    }
    return <Table rowKey='name'
             pagination={ false }
             dataSource={ data }
             columns={ this.getTableColumns(extended) } />;
  }

  renderExpandedRow(record) {
    return (
      <div>
        { record.description }
      </div>
      );
  }
}
