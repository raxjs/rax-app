import { merge } from '@builder/pack/deps/lodash';
import type { IManifest } from '../types';

const DEFAULT_MANIFEST = {
  appID: 'com.example.ace.helloworld',
  appName: 'HelloAce',
  versionName: '1.0.0',
  versionCode: 1,
  minPlatformVersion: '1.0.1',
  window: {
    designWidth: 750, autoDesignWidth: false,
  },
};

export default function getManifest(entries, { staticConfig, nativeConfig }): IManifest {
  const manifest: IManifest = {
    pages: entries.map(({ entryName }) => `pages/${entryName}`),
    window: staticConfig.window,
  };

  return merge(DEFAULT_MANIFEST, manifest, nativeConfig);
}
