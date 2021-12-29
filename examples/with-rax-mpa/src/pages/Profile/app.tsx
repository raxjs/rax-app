import { render, createElement } from 'rax';
import Driver from 'driver-universal';
import Profile from './index';

render(<Profile />, null, {
  driver: Driver
});
