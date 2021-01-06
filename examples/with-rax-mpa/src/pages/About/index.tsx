import { createElement, PureComponent } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import store from './store';
import './index.css';

class About extends PureComponent {
  render() {
    const { counter: counterStore } = this.props as any;
    const [state, dispatchers] = counterStore;

    return (
      <View className="about">
        <Text className="title">About Page</Text>
        <Text className="info" onClick={dispatchers.increment}>Home Count: {state.count}</Text>
      </View>
    );
  }
}

export default store.withModel('counter')(About);
