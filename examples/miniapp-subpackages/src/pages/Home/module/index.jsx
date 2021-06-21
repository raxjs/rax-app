import { createElement } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import { isMiniApp } from 'universal-env';
import { getA, setA } from '@/test';

import styles from './index.module.css';

import Logo from '@/components/Logo';

export default function Home() {
  console.log('home a ===>', getA());
  return (
    <View className={styles.homeContainer}>
      <Logo uri="//gw.alicdn.com/tfs/TB1MRC_cvb2gK0jSZK9XXaEgFXa-1701-1535.png" />
        <Text
          className={styles.homeTitle}
          onClick={() => {
            setA(2);
            console.log('home change a ====>', getA());
            if (isMiniApp) {
              my.navigateTo({
                url: '/pages/About/module/index',
              });
            } else {
              wx.navigateTo({
                url: '/pages/About/module/index',
              });
            }
          }}
        >
          点我去到子包页面
      </Text>
      <Text className={styles.homeInfo}>More information about Rax</Text>
      <Text className={styles.homeInfo}>Visit https://rax.js.org</Text>
    </View>
  );
}
