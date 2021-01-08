module.exports = (api) => {
  const { registerMethod, setValue, getValue } = api;

  registerMethod('rax.modifyStaticConfig', (callback) => {
    const staticConfig = getValue('staticConfig');
    setValue('staticConfig', callback(staticConfig));
  });
};
