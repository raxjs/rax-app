import { createElement } from 'rax';
import Logo from '@/components/Logo';

// @ts-ignore
import styles from './index.css';

export default function Home(props) {
  return (
    <div style={styles.home}>
      <Logo />
      <text style={styles.title}>Welcome to Your Rax App</text>
      <text style={styles.info}>More information about Rax</text>
    </div>
  );
}
