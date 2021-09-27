import { createElement, PureComponent } from 'rax';

import './index.css';

class Logo extends PureComponent {
  render() {
    const source = {
      uri: `${process.env.PUBLIC_URL}/rax.png`,
    };
    console.log('with router =>', this.props);
    return (
      <image
        className="logo"
        source={source}
      />
    );
  }
}

export default Logo;
