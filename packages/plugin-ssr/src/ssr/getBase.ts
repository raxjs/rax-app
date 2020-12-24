import * as path from 'path';
import setMPAConfig from '@builder/mpa-config';
import { formatPath, getMpaEntries } from '@builder/app-helpers';
import getEntryName from './getEntryName';
import EntryPlugin from './entryPlugin';
import { GET_RAX_APP_WEBPACK_CONFIG, NODE, STATIC_CONFIG } from '../constants';

// Can‘t clone webpack chain object, so generate a new chain and reset config
export default (api) => {
  const { context, getValue } = api;
  const { userConfig, rootDir } = context;
  const { web: webConfig = {} } = userConfig;

  const getWebpackBase = getValue(GET_RAX_APP_WEBPACK_CONFIG);

  const config = getWebpackBase(api, {
    target: NODE,
    babelConfigOptions: { styleSheet: true },
    progressOptions: {
      name: 'SSR',
    },
  });

  config.name('node');
  const staticConfig = getValue(STATIC_CONFIG);

  let entries = {};
  if (webConfig.mpa) {
    const mpaEntries = getMpaEntries(api, { target: 'web', appJsonContent: staticConfig });
    setMPAConfig(api, config, { type: NODE, entries: mpaEntries });
    entries = mpaEntries.map(({ entryName, entryPath, source }) => {
      return {
        name: entryName,
        entryPath: formatPath(path.join(rootDir, 'src', entryPath)),
        source,
      };
    });
  } else {
    entries = staticConfig.routes.map((route) => {
      return {
        name: getEntryName(route.path),
        entryPath: formatPath(path.join(rootDir, 'src', route.source)),
        source: route.source,
      };
    });
  }

  config.plugin('entryPlugin').use(EntryPlugin, [
    {
      entries,
      api,
    },
  ]);

  return config;
};
