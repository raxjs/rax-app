export default function (fileInfo) {
  const appJSON = JSON.parse(fileInfo.source);

  return JSON.stringify(appJSON, null, 2);
}
