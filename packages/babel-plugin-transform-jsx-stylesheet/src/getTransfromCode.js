import syntaxJSX from 'babel-plugin-syntax-jsx';
import { transform } from 'babel-core';
import jSXStylePlugin from './index';

export default function getTransfromCode(code, opts) {
  return transform(code, {
    plugins: [
      [jSXStylePlugin, opts],
      syntaxJSX
    ]
  }).code;
}
  