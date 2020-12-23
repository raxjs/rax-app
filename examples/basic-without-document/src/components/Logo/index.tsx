import { createElement, PureComponent } from 'rax';
import Image from 'rax-image';

import './index.css';

class Logo extends PureComponent {
  render() {
    const source = {
      uri: 'https://img.alicdn.com/imgextra/i4/O1CN0145ZaIM1QEObAAbKa1_!!6000000001944-2-tps-1701-1535.png',
    };
    console.log('with router =>', this.props);
    return (
      <Image
        className="logo"
        source={source}
      />
    );
  }
}

export default Logo;
