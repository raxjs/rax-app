module.exports = (config, context, value) => {
  if (value) {
    ['jsx', 'tsx'].forEach(tag => {
      config.module.rule(tag)
        .exclude
          .add(new RegExp(value));
    });
  }
};
