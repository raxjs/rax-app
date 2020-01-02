/**
 * 添加平台特定的文件扩展名
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
