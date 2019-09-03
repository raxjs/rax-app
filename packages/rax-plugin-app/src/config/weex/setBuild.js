module.exports = (config) => {
  config.optimization
    .minimizer('uglify')
      .tap((args) => {
        args[0].sourceMap = false;
        return args;
      })
      .end();
};
