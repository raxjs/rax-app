import { createElement } from 'rax';
import { runApp } from 'rax-app';
import staticConfig from './app.json';
import store from './store';

const Provider = store.Provider;

runApp({
  app: {
    addProvider: ({ children }) => {
      return <Provider>{children}</Provider>;
    },

    onShow() {
      console.log('app show...');
    },
    onHide() {
      console.log('app hide...');
    },
    getInitialData: async () => {
      return {
        a: 1,
        b: 2,
      };
    },
  },
}, staticConfig);
