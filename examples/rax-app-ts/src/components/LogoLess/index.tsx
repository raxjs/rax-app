import { createElement } from 'rax';
import Image from 'rax-image';

// import './index.css';
import './index.less';

// console.log(222, styles)

interface LogoProps {
  uri: string;
}

export default (props: LogoProps) => {
  const { uri } = props;
  const source = { uri };
  return (
    <div className="less-con">
      LogoLess 红色
      <Image
        className="logo"
        source={source}
      />
    </div>
  );
}
