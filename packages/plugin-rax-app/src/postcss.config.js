const defaultPostcssConfig = require('./defaultPostcssConfig');

module.exports = ({ options }) => ({
  ...defaultPostcssConfig(options),
});
