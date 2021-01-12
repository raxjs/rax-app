import { createElement, render } from 'rax';
import Driver from 'driver-universal';

render(<div>Detail Page</div>, document.body, {
  driver: Driver
});
