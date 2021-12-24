import { createElement, PureComponent } from 'rax';
import Image from 'rax-image';

import './index.css';

class Logo extends PureComponent {
  render() {
    const source = {
      uri: `${process.env.PUBLIC_URL}/rax.png`,
    };
    console.log('with router11111 =>', this.props);
    return (
      <Image
        className="logo"
        source={source}
      />
    );
  }
}

export default Logo;
