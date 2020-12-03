import { createElement } from 'rax';
import Image from 'rax-image';

import './index.css';

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return <Image className="rax-demo-logo" source={source} />;
};
