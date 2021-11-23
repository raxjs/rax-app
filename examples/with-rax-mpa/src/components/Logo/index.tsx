import { createElement, PureComponent } from 'rax';

import './index.css';

class Logo extends PureComponent {
  render() {
    return (
      <image
        className="logo"
        src={'https://img.alicdn.com/imgextra/i4/O1CN0145ZaIM1QEObAAbKa1_!!6000000001944-2-tps-1701-1535.png'}
      />
    );
  }
}

export default Logo;
