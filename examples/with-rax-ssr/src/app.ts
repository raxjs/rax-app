import { runApp, } from 'rax-app';

const appConfig = {
  app: {
    getInitialData: async (ctx) => {
      // const data = await fetch('/api/data');
      const user = { name: 'Jack Ma', id: '01' };
      return { user }
    }
  }
}

runApp(appConfig);
