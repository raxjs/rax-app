import { createElement } from 'rax';
import Image from 'rax-image';
import View from 'rax-view';
import Text from 'rax-text';
// import './index.css';
import './index.less';

// console.log(222, styles)

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return (
    <View className="less-con">
      <Text>LogoLess 红色</Text>
      <Image
        className="logo"
        source={source}
      />
    </View>
  );
}
