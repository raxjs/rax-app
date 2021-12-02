import { createElement } from 'rax';
import { usePageShow, usePageHide, getSearchParams } from 'rax-app';
import View from 'rax-view';
import Text from 'rax-text';
import { isNode } from 'universal-env';
import Logo from '@/components/Logo';

import styles from './index.module.css';

export default function Home(props) {
  const { history } = props;

  const searchParams = getSearchParams();

  console.log('home search params =>', searchParams);
  console.log('home page props =>', props);

  usePageShow(() => {
    console.log('home show...');
  });

  usePageHide(() => {
    console.log('home hide...');
  });

  return (
    <View className={styles.home}>
      <Logo />
      <Text className={styles.title} id="title">
        {props?.data?.title || 'Welcome to Your Rax App'}
      </Text>
      <Text className={styles.info}>{props?.data?.info || 'More information about Rax'}</Text>
      <Text className={styles.info} id="link" onClick={() => (location.href = '/about?id=1')}>
        Go About
      </Text>
    </View>
  );
}

Home.getInitialProps = async () => {
  if (isNode) {
    return {
      data: {
        title: 'Welcome to Your Rax App with SSR',
        info: 'More information about Rax',
      },
    };
  }
};
