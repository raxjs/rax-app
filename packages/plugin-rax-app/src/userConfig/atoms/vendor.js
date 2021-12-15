module.exports = (config, vendor) => {
  if (!vendor) {
    config.optimization.splitChunks({ cacheGroups: {} });
  } else {
    // In Rax lazy load mode, all common module need be splited to vendor file
    config.optimization.splitChunks({ cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        enforce: true,
      },
    } });
  }
};
