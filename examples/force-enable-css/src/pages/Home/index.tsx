import { createElement } from 'rax';
import View from 'rax-view';

import Logo from '../../components/LogoCss';
import Logo2 from '../../components/LogoCssModule';
import Logo3 from '../../components/LogoLess';
import Logo4 from '../../components/LogoLessModule';
import Logo5 from '../../components/LogoSass';
import Logo6 from '../../components/LogoSassModule';

import './global.css';

export default function Home() {
  const source = '//gw.alicdn.com/tfs/TB1MRC_cvb2gK0jSZK9XXaEgFXa-1701-1535.png';
  return (
    <View className="container">
      <Logo uri={source} />
      <Logo2 uri={source} />
      <Logo3 uri={source} />
      <Logo4 uri={source} />
      <Logo5 uri={source} />
      <Logo6 uri={source} />
    </View>
  );
}
