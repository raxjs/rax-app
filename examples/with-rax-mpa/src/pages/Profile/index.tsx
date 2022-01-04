import { createElement, PureComponent } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import './index.css';

class Profile extends PureComponent {
  render() {
    return (
      <View className="about">
        <Text className="title">Profile Page</Text>
      </View>
    );
  }
}

export default Profile;
