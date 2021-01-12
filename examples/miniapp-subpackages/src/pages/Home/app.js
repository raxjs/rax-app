import { runApp } from 'rax-app';
import staticConfig from './app.json';

console.log('主包的 app 才会生效');
runApp({}, staticConfig);
