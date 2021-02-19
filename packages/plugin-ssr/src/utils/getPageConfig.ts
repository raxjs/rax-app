import { WEB } from '../constants';
import { getMpaEntries } from '@builder/app-helpers';

export default function (api, staticConfig) {
  const entries = getMpaEntries(api, {
    target: WEB,
    appJsonContent: staticConfig,
  });
  const map = {};
  entries.forEach(({ path: pathname, entryName, window }) => {
    if (entryName) {
      map[entryName] = {
        path: pathname,
        title: window?.title || staticConfig?.window?.title,
      };
    }
  });
  return map;
}
