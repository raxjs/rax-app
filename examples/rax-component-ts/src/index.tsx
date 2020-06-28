import { createElement } from 'rax';
import View from 'rax-view';
import Text from 'rax-text';

interface IProps {
  type: string;
};

const MyComponent = (props: IProps) => {
  return (
    <View>
      <Text>Hello World!</Text>
    </View>
  );
};

export default MyComponent;
