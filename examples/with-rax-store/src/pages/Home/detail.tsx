import { createElement } from 'rax';
import { usePageShow, usePageHide } from 'rax-app';
import View from 'rax-view';
import Text from 'rax-text';
import Logo from '@/components/Logo';
// import store from './store';

import './index.css';

export default function HomeDetail(props) {
  const { history } = props;
  // const [state, dispatchers] = store.useModel('counter');

  usePageShow(() => {
    console.log('home show...');
  });

  usePageHide(() => {
    console.log('home hide...');
  });

  return (
    <View className="home">
      <Logo />
      <Text className="title">Home Detail Page!!!</Text>
      {/* <Text className="info" onClick={dispatchers.increment}>Home Count: {state.count}</Text> */}
      <Text className="info" onClick={() => history.push('/about')}>Go About</Text>
    </View>
  );
}
