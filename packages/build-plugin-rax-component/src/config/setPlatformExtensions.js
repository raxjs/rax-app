/**
 * Platform-specific extensions
 * @param config
 * @param platform
 * @returns {*[]}
 */
module.exports = (config, platform) => {
  const extensions = config.toConfig().resolve.extensions;
  config.resolve.extensions.clear();
  config.resolve.extensions.merge([
    ...platform ? extensions.map((ext) => `.${platform}${ext}`) : [],
    ...extensions,
  ]);
}
