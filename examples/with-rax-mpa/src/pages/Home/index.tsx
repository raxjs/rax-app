import { createElement } from 'rax';
import Logo from '@/components/Logo';

import './index.css';

export default function Home(props) {
  return (
    <div className="home">
      <Logo/>
      <text className="title">Welcome to Your Rax App</text>
      <text className="info">More information about Rax</text>
    </div>
  );
}
