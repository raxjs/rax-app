import { createElement, Component } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import { getSearchParams } from 'rax-app';

import './index.css';

class About extends Component {
  componentDidMount() {
    console.log('about search params', getSearchParams());
  }

  render() {
    return (
      <View className="about">
        <Text className="title">About Page</Text>
        <Text className="info" onClick={() => (this.props as any).history.push('/')}>Go Home</Text>
      </View>
    );
  }
}

export default About;
