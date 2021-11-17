import { IPluginAPI } from 'build-scripts';
import setupDev from './setupDev';
import setupBuild from './setupBuild';
import setupTest from './setupTest';

export default function setupLaunch(api: IPluginAPI) {
  const { context: { command } } = api;

  if (command === 'start') {
    setupDev(api);
  }

  if (command === 'build') {
    setupBuild(api);
  }

  if (command === 'test') {
    setupTest(api);
  }
}
