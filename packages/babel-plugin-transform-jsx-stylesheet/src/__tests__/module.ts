import * as syntaxJSX from 'babel-plugin-syntax-jsx';
import { transform } from 'babel-core';
import jSXStylePlugin from '../index';

export default function getTransformCode(code, opts?) {
  return transform(code, {
    plugins: [
      [jSXStylePlugin, opts],
      syntaxJSX,
    ],
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

  it('should transform css when `forceEnable` is true and is not `*.module.css`', () => {
    expect(getTransformCode(`
  import { createElement, render } from 'rax';
  import styles from './app.css';

  render(<div className={styles.header} />);
  `, { forceEnableCSS: true })).toBe(`
import { createElement, render } from 'rax';
import styles from './app.css';

render(<div style={styles.header} />);`);
  })

  it('should not transform css when `forceEnable` is true and is `*.module.css`', () => {
    expect(getTransformCode(`
  import { createElement, render } from 'rax';
  import styles from './app.module.css';

  render(<div className={styles.header} />);
  `, { forceEnableCSS: true })).toBe(`
import { createElement, render } from 'rax';
import styles from './app.module.css';

render(<div className={styles.header} />);`);
  })

  it('should not transform css when `forceEnableCSS` is true and module or not module simultaneously exist', () => {
    expect(getTransformCode(`
import { createElement, render } from 'rax';
import app from './app.css';
import styles from './app.module.css';

render(<div className={styles.header} style={app.header} />);
`, { forceEnableCSS: true })).toBe(`
import { createElement, render } from 'rax';
import app from './app.css';
import styles from './app.module.css';

render(<div className={styles.header} style={app.header} />);`);
  });

  it('should transform code correctly when `retainClassName` is true', () => {
    expect(getTransformCode(`
import { createElement, render } from 'rax';
import styles from './app.css';

render(<div className={styles.header} />);
`, { retainClassName: true })).toBe(`
import { createElement, render } from 'rax';
import styles from './app.css';

render(<div style={styles.header} />);`);
  });
  expect(getTransformCode(`
import { createElement, render } from 'rax';
import styles from './app.css';

render(<div className={styles.header} />);
`, { retainClassName: true })).toMatchSnapshot();
});
