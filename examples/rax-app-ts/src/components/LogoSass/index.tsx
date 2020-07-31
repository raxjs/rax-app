import { createElement } from 'rax';
import Image from 'rax-image';

import './index.scss';

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return (
    <div className="sass-con">
      Sass 黑色
      <Image
        className="logo"
        source={source}
      />
    </div>
  );
}
