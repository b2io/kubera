const { injectBabelPlugin } = require('react-app-rewired');

const rewireBabelPlugin = (plugin, options = {}) => (
  config,
  env,
  injectedOptions = options
) => injectBabelPlugin([plugin, injectedOptions], config);

const flowRewires = (...wirings) => (config, env) =>
  wirings.reduce((prevConfig, wiring) => {
    const [wire, options] = Array.isArray(wiring) ? wiring : [wiring];

    return wire(prevConfig, env, options);
  }, config);

module.exports = flowRewires(
  rewireBabelPlugin('lodash'),
  rewireBabelPlugin('date-fns'),
  rewireBabelPlugin('transform-semantic-ui-react-imports')
);
