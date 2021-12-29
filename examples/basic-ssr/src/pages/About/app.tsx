import { createElement, Component } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import { getSearchParams, withPageLifeCycle } from 'rax-app';

import './index.css';

class About extends Component {
  onShow() {
    console.log('about show...');
    console.log('about search params', getSearchParams());
  }

  onHide() {
    console.log('about hide...');
  }

  render() {
    return (
      <View className="about">
        <Text className="title">About Page</Text>
        <Text className="info" onClick={() => (location.href = '/home')}>
          Go Home
        </Text>
      </View>
    );
  }
}

export default withPageLifeCycle(About);
