import BaseShell from './Shell';

const requireModuleMethod = `
function requireModule(moduleName) {
  return requireNative(moduleName.slice(1));
}
`;

export default class LiteShell extends BaseShell {
  generateApp() {
    return `${requireModuleMethod}
    var options = ${this.content};

    new ViewModule(options);
  `;
  }
}
