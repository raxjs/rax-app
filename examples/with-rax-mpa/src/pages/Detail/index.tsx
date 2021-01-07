function render() {
  const ele = document.createElement('div');
  ele.innerHTML = 'test';
  const body = document.body;
  body.appendChild(ele);
}

render();
