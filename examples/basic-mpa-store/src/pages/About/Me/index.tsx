import { createElement } from 'rax';
import View from 'rax-view';
import store from './store';

export default function Home(props) {
  const [state] = store.useModel('counter');
  return (
    <>
      About me
      <View>
        count: {state.count}
      </View>
    </>
  );
}
