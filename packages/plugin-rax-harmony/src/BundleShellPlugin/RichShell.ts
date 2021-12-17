import getPageName from '../utils/getPageName';
import BaseShell from './Shell';

export default class RichShell extends BaseShell {
  generateApp() {
    return this.content;
  }

  generatePage() {
    return `
    export default {
      onReady() {
        var document = this.app.doc;
          document.body.__rendered = true;
          ${this.content}
      },
    }
    `;
  }
}
