import { createElement, useState } from 'rax';
import Logo from '@/components/Logo';
import router from '@system.router';

import './index.css';

export default function Home(props) {
  const [count, setCount] = useState(0);
  return (
    <div className="home">
      <Logo />
      <text className="title">Welcome to Your Rax App</text>
      <text className="info">More information about Rax</text>
      <div onClick={() => {
        setCount(count + 1);
      }}
      >
        <text>Count: {count}</text>
      </div>
    </div>
  );
}
