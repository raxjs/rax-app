import { createElement } from 'rax';
import Image from 'rax-image';
import View from 'rax-view';
import Text from 'rax-text';
import './index.css';

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return (
    <View className="css-con">
      <Text>CSS 蓝色</Text>
      <Image
        className="logo"
        source={source}
      />
    </View>
  );
}
