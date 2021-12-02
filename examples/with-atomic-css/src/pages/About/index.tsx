import { createElement, Component } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import { getSearchParams, withPageLifeCycle } from 'rax-app';
import BuggyCounter from '@/components/BuggyCounter';

import './index.css';

@withPageLifeCycle
class About extends Component {
  componentDidMount() {
    console.log('about search params', getSearchParams());
  }

  onShow() {
    console.log('about show...');
  }

  onHide() {
    console.log('about hide...');
  }

  render() {
    return (
      <View className="about">
        <Text className="title">About Page</Text>
        <Text className="info" onClick={() => (this.props as any).history.push('/')}>Go Home</Text>
        <BuggyCounter />
      </View>
    );
  }
}

export default About;
