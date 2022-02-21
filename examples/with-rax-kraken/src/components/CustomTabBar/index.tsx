import { createElement, PureComponent } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';

import './index.css';

class TabBar extends PureComponent {
  render() {
    return (
      <View className="about">
        <Text className="title">PHA TabBar</Text>
      </View>
    );
  }
}

export default TabBar;
