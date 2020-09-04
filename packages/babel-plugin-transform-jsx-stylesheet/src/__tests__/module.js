import syntaxJSX from 'babel-plugin-syntax-jsx';
import { transform } from 'babel-core';
import jSXStylePlugin from '../index';

export default function getTransformCode(code, opts) {
  return transform(code, {
    plugins: [
      [jSXStylePlugin, opts],
      syntaxJSX
    ]
  }).code;
}

describe('css module', () => {
  it('should transform css module', () => {
    expect(getTransformCode(`
  import { createElement, render } from 'rax';
  import styles from './app.css';
  
  render(<div className={styles.header} />);
  `)).toBe(`
import { createElement, render } from 'rax';
import styles from './app.css';

render(<div style={styles.header} />);`);
  });
});