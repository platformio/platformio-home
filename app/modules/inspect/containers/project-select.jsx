import { Select, Spin } from 'antd';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { generateProjectNameFromPath } from '@inspect/helpers';
import { loadProjects } from '@project/actions';
import { selectProjects } from '@project/selectors';

class ProjectSelectComponent extends React.PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired
      })
    ),
    onChange: PropTypes.func.isRequired,
    loadProjects: PropTypes.func.isRequired,
    value: PropTypes.string
  };

  constructor(...args) {
    super(...args);
    if (!this.props.items) {
      this.props.loadProjects();
    }
  }

  handleChange = idx => {
    const { items, onChange } = this.props;
    if (onChange) {
      onChange(items[parseInt(idx)].path);
    }
  };

  handleFilterOption = (input, option) =>
    option.props.children.toLowerCase().includes(input.toLocaleLowerCase());

  render() {
    const { items, value } = this.props;
    const selectedIdx = items ? items.findIndex(x => x.path === value) : -1;
    return (
      <div>
        <Select
          loading={!items}
          showSearch
          style={{ width: '100%' }}
          size="large"
          placeholder={items ? 'Select a project' : 'Loading…'}
          optionFilterProp="children"
          filterOption={this.handleFilterOption}
          onChange={this.handleChange}
          value={selectedIdx !== -1 ? selectedIdx : undefined}
        >
          {items &&
            items
              .map((x, idx) => ({
                ...x,
                idx,
                name: generateProjectNameFromPath(x.path)
              }))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(({ name, idx }) => (
                <Select.Option key={idx} value={idx}>
                  {name}
                </Select.Option>
              ))}
        </Select>
        {value && (
          <small style={{ display: 'block', lineHeight: 1, marginTop: 5 }}>
            {value}
          </small>
        )}
      </div>
    );
  }
}

// Redux

function mapStateToProps(state) {
  return {
    items: selectProjects(state)
  };
}

const dispatchProps = {
  loadProjects
};

export const ProjectSelect = connect(
  mapStateToProps,
  dispatchProps
)(ProjectSelectComponent);
