import { createElement } from 'rax';
import router from '@system.router';

import './index.css';

export default function Home(props) {
  return (
    <div className="about">
      <text className="title">This is About Page</text>
      <div onClick={() => {
        router.push({
          uri: 'pages/home/index',
        });
      }}
      >
        <text>Go back!</text>
      </div>
    </div>
  );
}
