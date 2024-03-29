import { IStoreDispatch } from 'rax-app';

export const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(null), time));

export default {
  state: {
    count: 0,
  },

  reducers: {
    increment(prevState) {
      return { count: prevState.count + 1 };
    },
    decrement(prevState) {
      return { count: prevState.count - 1 };
    },
  },

  effects: (dispatch: IStoreDispatch) => ({
    async decrementAsync() {
      await delay(10);
      dispatch.counter.decrement();
    },
  }),
};
