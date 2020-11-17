import { createElement } from 'rax';
import Image from 'rax-image';
import View from 'rax-view';
import Text from 'rax-text';
import './index.scss';

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return (
    <View className="sass-con">
      <Text>Sass 黑色</Text>
      <Image
        className="logo"
        source={source}
      />
    </View>
  );
}
