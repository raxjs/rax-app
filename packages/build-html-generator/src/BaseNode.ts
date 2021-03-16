import { IPlaceholderOptions } from './types';

export default class BaseNode {
  innerHTML = '';
  insertedAfterElements: string[] = [];
  insertedBeforeElements: string[] = [];
  placeholderOptions: IPlaceholderOptions;
  constructor(placeholderOptions) {
    this.placeholderOptions = placeholderOptions;
  }

  insertAfter(elements: string | string[]) {
    if (Array.isArray(elements)) {
      this.insertedAfterElements = [...this.insertedAfterElements, ...elements];
    } else if (typeof elements === 'string') {
      this.insertedAfterElements.push(elements);
    }
  }

  insertBefore(elements: string | string[]) {
    if (Array.isArray(elements)) {
      this.insertedBeforeElements = [...this.insertedBeforeElements, ...elements];
    } else if (typeof elements === 'string') {
      this.insertedBeforeElements.push(elements);
    }
  }

  replacePlaceholder(placeholder, value, html) {
    if (placeholder) {
      return html.replace(placeholder, value);
    }
    return html;
  }
}
