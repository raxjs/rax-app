import { getMpaEntries } from '@builder/app-helpers';
import { WEB } from '../constants';

export default function (api, staticConfig) {
  const entries = getMpaEntries(api, {
    target: WEB,
    appJsonContent: staticConfig,
  });
  const map = {};
  entries.forEach(({ entryName, entryPath, ...pageConfig }) => {
    if (entryName) {
      map[entryName] = pageConfig;
    }
  });
  return map;
}
