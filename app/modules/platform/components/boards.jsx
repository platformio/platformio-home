/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Alert, Badge, Button, Icon, Input, Spin, Table, Tooltip } from 'antd';

import { INPUT_FILTER_DELAY } from '../../../config';
import PropTypes from 'prop-types';
import React from 'react';
import { cmpSort } from '../../core/helpers';
import fuzzaldrin from 'fuzzaldrin-plus';
import humanize from 'humanize';


export default class Boards extends React.Component {

  static IoTConnectivity =['wifi', 'bluetooth', 'ethernet', 'cellular'];

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      vendor: PropTypes.string.isRequired,
      platform: PropTypes.shape({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
      }).isRequired,
      frameworks: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
      })).isRequired,
      mcu: PropTypes.string.isRequired,
      fcpu: PropTypes.number.isRequired,
      rom: PropTypes.number.isRequired,
      ram: PropTypes.number.isRequired
    })),
    noHeader: PropTypes.bool,
    excludeColumns: PropTypes.arrayOf(PropTypes.string),
    defaultFilter: PropTypes.string,
    onFilter: PropTypes.func,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      data: null,
      filterValue: this.props.defaultFilter,
      dataFilters: null,
      dataSorters: null
    };
    if (this.props.items) {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state.data = this.normalizeTableData(this.props.items);
    }
    this._filterTimer = null;
  }

  componentDidMount() {
    if (this._searchInputElement) {
      this._searchInputElement.focus();
    }
  }

  componentWillReceiveProps(newProps) {
    if (!this.state.data && newProps.items) {
      this.setState({
        data: this.normalizeTableData(newProps.items)
      });
    }
  }

  normalizeTableData(items) {
    if (!items) {
      return items;
    }
    let result = items.slice(0);

    if (this.state.filterValue) {
      items = fuzzaldrin.filter(items.map(item => {
        item._fuzzy = [
          item.vendor,
          item.id,
          item.name,
          item.mcu,
          JSON.stringify(item.platforms),
          JSON.stringify(item.frameworks)
        ].join(' ');
        return item;
      }), this.state.filterValue, {
        key: '_fuzzy'
      });
    }

    result = items.map(item => {
      item.frameworks = item.frameworks.sort((a, b) => cmpSort(a.name.toUpperCase(), b.name.toUpperCase()));
      item.extra = ['test'];
      // if (item.url.includes('pjrc')) {
      //   item.extra.push('certified');
      //   item.extra.push('shop');
      // }
      if (item.debug) {
        item.extra.push('debug');
      }
      if ((item.connectivity || []).some(c => Boards.IoTConnectivity.includes(c))) {
        item.extra.push('iot');
      }
      // remove fuzzy helper data
      if (item._fuzzy) {
        delete item._fuzzy;
      }
      return item;
    });
    if (this.state.filterValue) {
      return result;
    }
    return result
      .sort((a, b) => cmpSort(a.name.toUpperCase(), b.name.toUpperCase()))
      .sort((a, b) => {
      const aInc = a.extra.includes('certified');
      const bInc = b.extra.includes('certified');
      if (aInc && !bInc) {
        return -1;
      }
      if (!aInc && bInc) {
        return 1;
      }
      return 0;
    });
  }

  onDidFilter(value) {
    this.setState({
      filterValue: value
    });
    if (this._filterTimer) {
      clearInterval(this._filterTimer);
    }
    this._filterTimer = setTimeout(() => {
      this.setState({
        data: this.normalizeTableData(this.props.items)
      });
      if (this.props.onFilter) {
        this.props.onFilter(value);
      }
    }, INPUT_FILTER_DELAY);
  }

  onDidTableChange(_, filters, sorters) {
    this.setState({
      dataFilters: filters,
      dataSorters: sorters
    });
  }

  onDidClearDataFiltersAndSorters() {
    this.setState({
      dataFilters: null,
      dataSorters: null
    });
    this.onDidFilter(null);
  }

  onToggleExtraFilter(value) {
    const filters = this.state.dataFilters || {};
    filters.extra = filters.extra || [];
    const index = filters.extra.indexOf(value);
    if (index !== -1) {
      filters.extra.splice(index, 1);
    } else {
      filters.extra.push(value);
    }
    this.setState({
      dataFilters: filters
    });
  }

  humanizeMemorySize(size) {
    return humanize.filesize(size, 1024, size % 1024 === 0 || size < 1024 ? 0 : 1);
  }

  humanizeDebug(debug) {
    if (!debug || !debug.tools) {
      return;
    }
    const tools = [];
    Object.keys(debug.tools).forEach(key => {
      const options = debug.tools[key];
      const attrs = [];
      if (options.default) {
        attrs.push('default');
      }
      if (options.onboard) {
        attrs.push('on-board');
      }
      if (attrs.length) {
        tools.push(`${key} (${attrs.join(', ')})`);
      } else {
        tools.push(key);
      }
    });
    return tools.join(', ');
  }

  getVendorFilters(data) {
    let result = [];
    data.forEach(item => {
      if (!result.includes(item.vendor)) {
        result.push(item.vendor);
      }
    });
    result = result.map(vendor => ({
      value: vendor,
      text: vendor
    }));
    return result.sort((a, b) => cmpSort(a.value.toUpperCase(), b.value.toUpperCase()));
  }

  getPlatformFilters(data) {
    const result = [];
    const candidates = new Map();
    data.map(item => candidates.set(item.platform.name, item.platform.title));
    for (var [name, title] of candidates.entries()) {
      result.push({
        value: name,
        text: title
      });
    }
    return result.sort((a, b) => cmpSort(a.value.toUpperCase(), b.value.toUpperCase()));
  }

  getFrameworkFilters(data) {
    const result = [];
    const candidates = new Map();
    data.map(board => board.frameworks.map(item => candidates.set(item.name, item.title)));
    for (var [name, title] of candidates.entries()) {
      result.push({
        value: name,
        text: title
      });
    }
    return result.sort((a, b) => cmpSort(a.value.toUpperCase(), b.value.toUpperCase()));
  }

  isExtraFilterEnabled(value) {
    const filters = this.state.dataFilters || {};
    return filters && filters.extra && filters.extra.includes(value);
  }

  getDataTotal(data) {
    if (!data) {
      return;
    }
    let total = 0;
    let values = null;
    const filters = this.state.dataFilters || {};
    data.forEach(item => {
      for (const key of Object.keys(filters)) {
        if (!filters[key] || !filters[key].length) {
          continue;
        }
        switch (key) {
          case 'frameworks':
            values = item.frameworks.map(f => f.name);
            if (!filters[key].find(f => values.includes(f))) {
              return;
            }
            break;

          case 'extra':
            if (!filters[key].every(value => item.extra.includes(value))) {
              return;
            }
            break;

          case 'platform':
            if (!filters[key].includes(item.platform.name)) {
              return;
            }
            break;

          case 'name':
            if (!filters[key].includes(item.vendor)) {
              return;
            }
            break;

          default:
            if (!filters[key].includes(item[key])) {
              return;
            }
            break;
        }
      }
      total++;
    });
    return total;
  }

  getTableColumns(data) {
    const dataFilters = this.state.dataFilters || {};
    const dataSorters = this.state.dataSorters || {};
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        filteredValue: dataFilters.name || null,
        filters: this.getVendorFilters(data),
        onFilter: (value, record) => record.vendor === value,
        sorter: (a, b) => cmpSort(a.name.toUpperCase(), b.name.toUpperCase()),
        sortOrder: dataSorters.columnKey === 'name' && dataSorters.order
      },
      {
        title: 'Platform',
        key: 'platform',
        filteredValue: dataFilters.platform || null,
        filters: this.getPlatformFilters(data),
        onFilter: (value, record) => record.platform.name === value,
        render: (_, record) => (
          <a onClick={ () => this.props.showPlatform(record.platform.name) }>
            { record.platform.title }
          </a>
        )
      },
      {
        title: 'Frameworks',
        key: 'frameworks',
        filteredValue: dataFilters.frameworks || null,
        filters: this.getFrameworkFilters(data),
        onFilter: (value, record) => record.frameworks.map(item => item.name).includes(value),
        render: (_, record) => (
          <span>{ record.frameworks.map((framework, index) => (
          <span key={ framework.title }>
            <a onClick={ () => this.props.showFramework(framework.name) }>
             { framework.title}
            </a>
            { record.frameworks.length > index + 1 ? ', ' : '' }
          </span>
        )) }</span>
        )
      },
      {
        title: 'MCU',
        dataIndex: 'mcu',
        sorter: (a, b) => cmpSort(a.mcu.toUpperCase(), b.mcu.toUpperCase()),
        sortOrder: dataSorters.columnKey === 'mcu' && dataSorters.order
      },
      {
        title: 'FRQ',
        key: 'fcpu',
        className: 'text-nowrap',
        sorter: (a, b) => cmpSort(a.fcpu, b.fcpu),
        sortOrder: dataSorters.columnKey === 'fcpu' && dataSorters.order,
        render: (_, record) => <span>{ Math.round(record.fcpu / 1000000) } Mhz</span>
      },
      {
        title: 'ROM',
        key: 'rom',
        className: 'text-nowrap',
        sorter: (a, b) => cmpSort(a.rom, b.rom),
        sortOrder: dataSorters.columnKey === 'rom' && dataSorters.order,
        render: (_, record) => this.humanizeMemorySize(record.rom)
      },
      {
        title: 'RAM',
        key: 'ram',
        className: 'text-nowrap',
        sorter: (a, b) => cmpSort(a.ram, b.ram),
        sortOrder: dataSorters.columnKey === 'ram' && dataSorters.order,
        render: (_, record) => this.humanizeMemorySize(record.ram)
      },
      {
        title: 'Extra',
        key: 'extra',
        className: 'board-extra-column',
        filters: [
          // {
          //   text: 'Certified Board',
          //   value: 'certified'
          // },
          {
            text: 'IoT-enabled',
            value: 'iot'
          },
          {
            text: 'Unit Testing',
            value: 'test'
          },
          {
            text: 'Unified Debugger',
            value: 'debug'
          },
          // {
          //   text: 'Get Now!',
          //   value: 'shop'
          // }
        ],
        filteredValue: dataFilters.extra || null,
        onFilter: (_, record) => this.state.dataFilters.extra.every(value => record.extra.includes(value)),
        render: (_, record) => this.renderExtraFeatures(record)
      }
    ];
    if (!this.props.excludeColumns) {
      return columns;
    }
    return columns.filter(item => !this.props.excludeColumns.includes(item.title));
  }

  render() {
    const data = this.state.data;
    return (
      <div className='board-explorer'>
        { !this.props.noHeader && this.renderHeader(data) }
        <Input className='block input-search-lg'
          placeholder='Search board...'
          value={ this.state.filterValue || this.props.defaultFilter }
          size='large'
          onChange={ e => this.onDidFilter(e.target.value) }
          ref={ elm => this._searchInputElement = elm } />
        { !data &&
          <div className='text-center'>
            <Spin tip='Loading...' size='large' />
          </div> }
        { data && data.length === 0 &&
          <ul className='background-message text-center'>
            <li>
              No Results
            </li>
          </ul> }
        { data && data.length > 0 && (
          <div>
            { this.renderToolbar() }
            { this.renderTable(data) }
          </div>
          ) }
      </div>
      );
  }

  renderHeader(data) {
    const total = this.getDataTotal(data);
    return (
      <div>
        <h1>Board Explorer <Badge overflowCount={ 1000 } count={ total } /></h1>
        <Alert className='block' showIcon message={ this.renderNotifications() } />
      </div>
    );
  }

  renderNotifications() {
    return (
      <span>
        <p>PlatformIO currently supports over 400 boards from leading manufacturers, and we are constantly adding new ones.</p>
        You can be part of the process by letting us know what board you wish to see supported next, by <a onClick={ () => this.props.openUrl('https://github.com/platformio/platformio-core/issues') }>submitting a feature request</a>.
      </span>
    );
  }

  renderToolbar() {
    return (
      <div className='block text-right'>
      <ul className='list-inline'>
        <li>
          <Button icon='filter' onClick={ ::this.onDidClearDataFiltersAndSorters }>
            Clear filters
          </Button>
        </li>
        <li>
          <Button.Group>
            {/* <Button type='primary'
              icon='safety'
              ghost={ !this.isExtraFilterEnabled('certified') }
              onClick={ () => this.onToggleExtraFilter('certified') }>
              Certified
            </Button> */}
            <Button type='primary'
              icon='cloud-o'
              ghost={ !this.isExtraFilterEnabled('iot') }
              onClick={ () => this.onToggleExtraFilter('iot') }>
              IoT-enabled
            </Button>
            <Button type='primary'
              icon='tool'
              ghost={ !this.isExtraFilterEnabled('debug') }
              onClick={ () => this.onToggleExtraFilter('debug') }>
              Debugger
            </Button>
            {/* <Button type='primary'
              icon='shopping-cart'
              ghost={ !this.isExtraFilterEnabled('shop') }
              onClick={ () => this.onToggleExtraFilter('shop') }>
              Get Now!
            </Button> */}
          </Button.Group>
        </li>
      </ul>
    </div>
    );
  }

  renderTable(data) {
    const pagination = {
      defaultPageSize: 15,
      pageSizeOptions: ['10', '15', '30', '50', '100', '1000'],
      size: 'default',
      showSizeChanger: true
    };

    return <Table size='middle'
             rowKey='id'
             pagination={ pagination }
             expandedRowRender={ ::this.renderExpandedRow }
             columns={ this.getTableColumns(data) }
             dataSource={ data }
             onChange={ ::this.onDidTableChange } />;
  }

  renderExpandedRow(record) {
    return (
      <ul className='list-inline'>
        <li>
          <Tooltip title='Board ID'>
            <kbd>board = { record.id }</kbd>
          </Tooltip>
        </li>
        <li>
          ·
        </li>
        <li>
          <Icon type='info-circle' /> <a onClick={ () => this.props.openUrl(record.url) }>Information</a>
        </li>
        <li>
          ·
        </li>
        { record.connectivity && (
        <li>
          <Icon type='global' /> Connectivity: { (record.connectivity || ['-']).map(c => c.toUpperCase()).join(', ') }
        </li>
        ) }
      </ul>);
  }

  renderExtraFeatures(record) {
    return (
      <span>
        { record.extra.includes('test') && <Tooltip title='Unit Testing'> <a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/plus/unit-testing.html') }> <Icon type='api' /> </a> </Tooltip> }
        { record.extra.includes('debug') && <Tooltip title={ `Unified Debugger: ${ this.humanizeDebug(record.debug) }` }> <a onClick={ () => this.props.openUrl('http://docs.platformio.org/page/plus/debugging.html') }> <Icon type='tool' /> </a> </Tooltip> }
        { record.extra.includes('iot') && <Tooltip title='IoT-enabled'> <a><Icon type='cloud-o' /></a> </Tooltip> }
        { record.extra.includes('certified') && <Tooltip title='Certified'> <a> <Icon type='safety' /> </a> </Tooltip> }
        { record.extra.includes('shop') && <Tooltip title='Get Now!'> <a onClick={ () => this.props.openUrl(record.url) }> <Icon type='shopping-cart' /> </a> </Tooltip> }
    </span>
    );
  }

}
