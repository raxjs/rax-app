import wrapFunc from './wrapFunc';
import BaseNode from './BaseNode';

export default class RootNode extends BaseNode {
  generate(html: string): string {
    const { prependPlaceholder, placeholder, appendPlaceholder } = this.placeholderOptions;
    return wrapFunc(
      html,
      this.replacePlaceholder.bind(this, prependPlaceholder, this.insertedBeforeElements.join('\n')),
      this.replacePlaceholder.bind(this, placeholder, this.innerHTML),
      this.replacePlaceholder.bind(this, appendPlaceholder, this.insertedAfterElements.join('\n')),
    );
  }
}
