const generateManifest = require('./generateManifest');
const generateContainer = require('./generateContainer');

module.exports = async(options = {}) => {
  const isReady = await generateContainer(options);
  if (!isReady) {
    console.error('Environment setup failed for Quick App！');
    process.exit(1);
  } else {
    generateManifest(options);
    console.log('\nWatching file changes...');
  }
};
