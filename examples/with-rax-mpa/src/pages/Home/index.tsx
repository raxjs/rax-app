import { createElement } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import Logo from '@/components/Logo';

import './index.css';

class Rectangle {
  height: any;
  width: any;
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

export default function Home(props) {
  return (
    <View className="home">
      <Logo />
      <Text className="title">Welcome to Your Rax App</Text>
      <Text className="info">More information about Rax</Text>
    </View>
  );
}
