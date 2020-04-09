const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const GITHUB = 'https://github.com/';
const GITHUB_API = 'https://api.github.com/';
const DefaultVersion = '1.3.1';

module.exports = async(repoName, appPath, dest) => {
  const latestReleaseApi = `${GITHUB_API}repos/${repoName}/releases/latest`;
  let latestTagName = '';
  try {
    let res = await fetch(latestReleaseApi);
    res = await res.json();
    latestTagName = res.tag_name;
  } catch (error) {
    latestTagName = DefaultVersion;
  }

  const downloadUrl = `${GITHUB}${repoName}/archive/${latestTagName}.zip`;
  try {
    const packageRes = await fetch(downloadUrl);
    // createWriteStream
    const writeStream = () => new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(dest);
      packageRes.body.pipe(fileStream);
      fileStream.on('error', reject);
      fileStream.on('finish', (res) => {
        console.log('finish', res);
        if (fs.existsSync(dest)) {
          resolve();
        } else {
          reject();
        }
      });
    });
    await writeStream();
  } catch (error) {
    throw error;
  }
};
