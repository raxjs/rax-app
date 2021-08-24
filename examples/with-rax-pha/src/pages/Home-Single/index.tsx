import { createElement } from 'rax';
import { usePageShow, usePageHide, getSearchParams } from 'rax-app';
import View from 'rax-view';
import Text from 'rax-text';

import './index.css';

export default function Home(props) {
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
    <View className="home">
      <Text className="title">PHA Custom TabBar</Text>
    </View>
  );
}

Home.getInitialProps = async () => {
  return {
    data: {
      title: 'Welcome to Your Rax App with SSR',
      info: 'More information about Rax',
    },
  };
};
