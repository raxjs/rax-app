import { createElement } from 'rax';
import { usePageShow, usePageHide, getSearchParams } from 'rax-app';
import View from 'rax-view';
import Text from 'rax-text';
import Logo from '@/components/Logo';
import store from './store';
import './index.css';

export default function Home(props) {
  const searchParams = getSearchParams();
  const [state, dispatchers] = store.useModel('counter');

  console.log('home search params =>', searchParams);
  console.log('home page props =>', props);

  usePageShow(() => {
    console.log('home show...');
  });

  usePageHide(() => {
    console.log('home hide...');
  });

  return (
    <View className="home">
      <Logo />
      <Text className="title">{props?.data?.title || 'Welcome to Your Rax App'}</Text>
      <Text className="info">{props?.data?.info || 'More information about Rax'}</Text>
      <Text id="count" className="info" onClick={dispatchers.increment}>Home Count: {state.count}</Text>
    </View>
  );
}
