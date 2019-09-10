const { getOptions } = require('loader-utils');

/**
 * Universal App Shell Loader for Rax.
 */
module.exports = function (content) {

  const options = getOptions(this) || {};
  // Transfer param type
  return content.replace('universal-app-config-loader', `universal-app-config-loader?type=${options.type}`)
};

/**
 * Get app.json content at picth loader.
 * @param remainingRequest
 * @param precedingRequest
 * @param data
 */
module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  data.appConfig = null; // Provide default value.

  try {
    const configPath = this.resourcePath.replace(/\.js$/, '.json');
    const rawContent = this.fs.readFileSync(configPath).toString();

    data.appConfig = JSON.parse(rawContent);
    this.addDependency(configPath);
  } catch (err) {
    throw new Error('Can not get app.json, please check.');
  }
};
