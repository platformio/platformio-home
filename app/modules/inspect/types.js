import PropTypes from 'prop-types';

export const ConfigurationType = PropTypes.shape({
  code: PropTypes.bool,
  env: PropTypes.string.isRequired,
  memory: PropTypes.bool,
  projectDir: PropTypes.string.isRequired
});
