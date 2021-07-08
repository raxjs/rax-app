import { createElement } from 'rax';
import { runApp, IAppConfig } from 'rax-app';

const appConfig: IAppConfig = {
  app: {
    onShow() {
      console.log('app show...');
    },
    onHide() {
      console.log('app hide...');
    },
  },
  store: {
    initialStates: {}
  }
};

runApp(appConfig);
