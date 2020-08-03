import { createElement } from 'rax';
import Image from 'rax-image';

// import './index.css';
import styles from './index.module.less';

// console.log(222, styles)

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return (
    <div className={styles.con}>
      logoLessModule 黄色
      <Image
        className={styles.logo}
        source={source}
      />
    </div>
  );
}
