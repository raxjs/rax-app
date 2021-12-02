import { createElement, useState } from 'rax';
import { usePageShow, usePageHide, getSearchParams } from 'rax-app';
import View from 'rax-view';
import Text from 'rax-text';
import Logo from '@/components/Logo';

import './index.css';

export default function Home(props) {
  const { history } = props;
  const [count, setCount] = useState(0);

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
      <Logo />
      <Text className="title">Welcome to Your Rax App</Text>
      <Text className="info">More information about Rax</Text>
      <Text
        onClick={() => {
          setCount(count + 1);
        }}
      >
        State: {count}
      </Text>
      <Text
        className="rounded-lg border border-gray-300 text-gray-100 bg-blue-500 px-4 py-2 m-2 inline-block hover:shadow cursor-pointer"
        id="link"
        onClick={() => history.push('/about', { id: 1 })}
      >
        Go About
      </Text>
    </View>
  );
}
