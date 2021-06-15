import { createElement } from 'rax';
import { runApp, IAppConfig } from 'rax-app';

const appConfig: IAppConfig = {
  router: {
    type: 'browser',
  },
  store: {
    initialStates: {}
  },
  app: {
    // ErrorBoundary
    errorBoundary: true,
    ErrorBoundaryFallback: () => <div>渲染错误</div>,

    // 生命周期
    onShow() {
      console.log('app show...');
    },
    onHide() {
      console.log('app hide...');
    },

    // 获取初始数据
    getInitialData: async () => {
      return {
        a: 1,
        b: 2,
      };
    },
  },
};

runApp(appConfig);
