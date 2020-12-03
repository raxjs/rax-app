import { createElement } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';
import Waterfall from 'rax-waterfall';
import { history } from 'rax-app';

import styles from './index.module.css';

let dataSource = [
  { height: 550, item: {} },
  { height: 624, item: {} },
  { height: 708, item: {} },
  { height: 600, item: {} },
  { height: 300, item: {} },
  { height: 100, item: {} },
  { height: 400, item: {} },
  { height: 550, item: {} },
  { height: 624, item: {} },
  { height: 708, item: {} },
  { height: 600, item: {} },
  { height: 300, item: {} },
  { height: 100, item: {} },
  { height: 400, item: {} }
];

export default function Home() {
  return (
    <View className={styles['rax-demo-home']}>
      <View onClick={() => history.goBack()}>Go back</View>
      <Waterfall
        columnWidth={150}
        columnCount={4}
        columnGap={50}
        dataSource={dataSource}
        renderHeader={() => {
          return [
            <View key="1" style={{ width: 750, height: 100, backgroundColor: 'yellow', marginBottom: 20 }}>header1</View>,
            <View key="2" style={{ width: 750, height: 100, backgroundColor: 'green', marginBottom: 20 }}>header2</View>
          ];
        }}
        renderFooter={() => {
          return <View key="3" style={{ width: 750, height: 300, backgroundColor: 'blue', marginTop: 20 }}>footer1</View>;
        }}
        renderItem={(item, index) => {
          return (<View style={{ height: item.height, backgroundColor: 'red', marginBottom: 20 }}>
            <Text>{index}</Text>
            {/* {index} */}
          </View>);
        }} />
    </View>
  );
}
