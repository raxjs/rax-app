let PHADevUrls = [];

function getPHADevUrls() {
  return PHADevUrls;
}

function setPHADevUrls(urls) {
  PHADevUrls = urls;
}

module.exports = {
  getPHADevUrls,
  setPHADevUrls,
};
