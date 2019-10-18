import PropTypes from 'prop-types';
import React from 'react';
import { Select } from 'antd';
import { connect } from 'react-redux';
import { loadProjectEnvironments } from '@inspect/actions';
import { selectProjectEnvironments } from '@inspect/selectors';

class ProjectEnvSelectComponent extends React.PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string.isRequired),
    onChange: PropTypes.func,
    onLoad: PropTypes.func.isRequired,
    project: PropTypes.string,
    value: PropTypes.string
  };

  constructor(...args) {
    super(...args);
    if (!this.props.items) {
      this.reload();
    }
  }

  componentDidUpdate(prevProps) {
    const { project, items, value, onChange } = this.props;

    // Reload when selected project has been changed
    if (project !== prevProps.project) {
      this.reload();
    }

    // Preselect single option when new items has been loaded
    if (items !== prevProps.items && items.length === 1) {
      const preselectValue = items[0];
      if (value !== preselectValue && onChange) {
        onChange(preselectValue);
      }
    }
  }

  reload() {
    if (this.props.project) {
      this.props.onLoad(this.props.project);
    }
  }

  handleChange = idx => {
    const { items, onChange } = this.props;
    if (onChange) {
      onChange(items[parseInt(idx)]);
    }
  };

  handleFilterOption = (input, option) =>
    option.props.children.toLowerCase().includes(input.toLocaleLowerCase());

  render() {
    const { items, project, value } = this.props;
    return (
      <Select
        loading={project && !items}
        disabled={!project}
        showSearch
        style={{ width: '100%' }}
        size="large"
        placeholder={items ? `Select environment (${items.length} available)` : ''}
        optionFilterProp="children"
        filterOption={this.handleFilterOption}
        value={project ? value : undefined}
        onChange={this.handleChange}
      >
        {items &&
          items
            .sort((a, b) => a.localeCompare(b))
            .map((name, idx) => <Select.Option key={idx}>{name}</Select.Option>)}
      </Select>
    );
  }
}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectProjectEnvironments(state, ownProps.project)
  };
}

const dispatchProps = {
  onLoad: loadProjectEnvironments
};

export const ProjectEnvSelect = connect(
  mapStateToProps,
  dispatchProps
)(ProjectEnvSelectComponent);
