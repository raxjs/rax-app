// module.exports = (config, context, value) => {
//   const { command } = context;

//   if (command === 'dev') {
//     config.output.publicPath(value);
//   }
// };

module.exports = {
  defaultValue: '/',
  validation: 'string',
  configWebpack: (config, value, context) => {
    const { command } = context;

    if (command === 'start') {
      config.output.publicPath(value);
    }
  },
};