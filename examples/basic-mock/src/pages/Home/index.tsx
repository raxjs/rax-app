import { createElement, useEffect } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import request from 'universal-request';
import Logo from '@/components/Logo';

import './index.css';

export default function Home() {
  useEffect(() => {
    request({
      url: '/api/users',
      data: {
        id: 123
      }
    }).then(res => {
      console.log('res', res)
    });
  }, []);

  return (
    <View className="home">
      <Logo />
      <Text className="title">Welcome to Your Rax App</Text>
      <Text className="info">More information about Rax</Text>
    </View>
  );
}
