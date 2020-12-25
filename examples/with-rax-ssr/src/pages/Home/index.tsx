import { createElement } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';

import styles from './index.module.css';
import Logo from '../../components/Logo';

function Home(props) {
  console.log('Home props===>', props);

  const { title, info, link, history } = props;
  return (
    <View className={styles.homeContainer}>
      <Logo uri="//gw.alicdn.com/tfs/TB1MRC_cvb2gK0jSZK9XXaEgFXa-1701-1535.png" />
      <Text className={styles.homeTitle}>{title}</Text>
      <Text className={styles.homeInfo}>{info}</Text>
      <Text className={styles.homeInfo}>{link}</Text>
      <Text className={styles.homeInfo} onClick={() => history.push('/about')}>Go About</Text>
    </View>
  );
}

Home.getInitialProps = (ctx) => {
  // console.log('Home getInitialProps ==>', ctx);
  return {
    title: 'Welcome to Your Rax App',
    info: 'More information about Rax',
    link: 'Visit https://rax.js.org'
  }
};

export default Home;
