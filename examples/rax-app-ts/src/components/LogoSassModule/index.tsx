import { createElement } from 'rax';
import Image from 'rax-image';
import styles from './index.module.scss';

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return (
    <div className={styles.con}>
      logoSassModule purple
      <Image
        className={styles.logo}
        source={source}
      />
    </div>
  );
}
