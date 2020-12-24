import { createElement } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';

import styles from './index.module.css';
import Logo from '../../components/Logo';

function About({ title, info, history }) {
  return (
    <View className={styles.container}>
      <Logo uri="//gw.alicdn.com/tfs/TB1MRC_cvb2gK0jSZK9XXaEgFXa-1701-1535.png" />
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.info}>{info}</Text>
      <Text className={styles.info} onClick={() => history.push('/')}>Go Home</Text>
    </View>
  );
}

About.getInitialProps = (ctx) => {
  console.log('getInitialProps About===>', ctx);
  return {
    title: 'About Page',
    info: 'About',
  }
};

export default About;
