const path = require('path');
const fs = require('fs-extra');

module.exports = (api) => {
  const { setValue, context } = api;
  const { rootDir } = context;
  try {
    const appJSONContent = fs.readFileSync(path.join(rootDir, 'src/app.json'));
    setValue('staticConfig', JSON.parse(appJSONContent));
  } catch (err) {
    throw new Error('There need app.json in root dir.');
  }
};
