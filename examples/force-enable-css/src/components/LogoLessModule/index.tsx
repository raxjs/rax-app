import { createElement } from 'rax';
import Image from 'rax-image';
import View from 'rax-view';
import Text from 'rax-text';
import styles from './index.module.less';

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return (
    <View className={styles.con}>
      <Text>logoLessModule 黄色</Text>
      <Image
        className={styles.logo}
        source={source}
      />
    </View>
  );
}
