import getTransfromCode from '../getTransfromCode';

describe('css module', () => {
    it('should transform css module', () => {
      expect(getTransfromCode(`
  import { createElement, render } from 'rax';
  import styles from './app.css';
  
  render(<div className={styles.header} />);
  `)).toBe(`
import { createElement, render } from 'rax';
import styles from './app.css';

render(<div style={styles.header} />);`);
});
});