module.exports = (userConfig = []) => {
  let targets = [];

  userConfig.plugins.forEach(config => {
    if (
      Array.isArray(config) &&
      config[0] === "build-plugin-rax-component" &&
      config[1] &&
      Array.isArray(config[1].targets)
    ) {
      targets = config[1].targets;
    }
  });

  return targets;
};
