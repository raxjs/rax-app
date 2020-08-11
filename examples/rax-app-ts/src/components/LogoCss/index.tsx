import { createElement } from 'rax';
import Image from 'rax-image';

import './index.css';

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return (
    <div className="css-con">
      CSS 蓝色
      <Image
        className="logo"
        source={source}
      />
    </div>
  );
}
