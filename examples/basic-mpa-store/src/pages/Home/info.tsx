import { createElement } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import Logo from '@/components/Logo';
import store from './store';
import './index.css';

export default function Home(props) {
  const [state, dispatchers] = store.useModel('counter');

  return (
    <View className="home">
      <Logo />
      <Text className="title">Home Info</Text>
      <Text id="count" className="info" onClick={dispatchers.increment}>Home Count: {state.count}</Text>
    </View>
  );
}
