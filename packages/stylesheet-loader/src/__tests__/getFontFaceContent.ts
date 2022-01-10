import { parse, getFontFaceContent } from '../index';
import * as css from 'css';
import * as loaderUtils from 'loader-utils';

describe('getFontFaceContent', () => {
  it('should convert `@font-face` correctly when use double quotes', () => {
    const font = `@font-face {
  font-family: "Open Sans";
  src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
        url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
}`;

    // getOptions can return null if no query passed.
    const parsedQuery = loaderUtils.getOptions(this) || {};

    // Compatible with string true.
    if (parsedQuery.log === 'true') {
      parsedQuery.log = true;
    }

    const { stylesheet } = css.parse(font);
    const { fontFaceRules } = parse(parsedQuery, stylesheet);

    expect(getFontFaceContent(fontFaceRules)).toMatchSnapshot();
  });

  it('should convert `@font-face` correctly when use single quotes', () => {
    const font = `@font-face {
  font-family: 'Open Sans';
  src: url('/fonts/OpenSans-Regular-webfont.woff2') format('woff2'),
        url('/fonts/OpenSans-Regular-webfont.woff') format('woff');
}`;

    // getOptions can return null if no query passed.
    const parsedQuery = loaderUtils.getOptions(this) || {};

    // Compatible with string true.
    if (parsedQuery.log === 'true') {
      parsedQuery.log = true;
    }

    const { stylesheet } = css.parse(font);
    const { fontFaceRules } = parse(parsedQuery, stylesheet);

    expect(getFontFaceContent(fontFaceRules)).toMatchSnapshot();
  });
});
