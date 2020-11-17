import { createElement } from 'rax';
import Image from 'rax-image';
import styles from './index.module.scss';
import View from 'rax-view';
import Text from 'rax-text';

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return (
    <View className={styles.con}>
      <Text>logoSassModule purple</Text>
      <Image
        className={styles.logo}
        source={source}
      />
    </View>
  );
}
