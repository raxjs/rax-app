module.exports = (api) => {
  const { context, modifyUserConfig } = api;
  const targetsInCommand = context.commandArgs.targets;
  if (targetsInCommand) {
    const targets = targetsInCommand.split(',');
    modifyUserConfig(() => {
      context.userConfig.targets = targets;
      return context.userConfig;
    });
  }
};
