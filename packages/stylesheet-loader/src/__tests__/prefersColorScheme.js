'use strict';

import { isPrefersColorScheme, processPrefersColorScheme } from '../processPrefersColorScheme';

describe('prefersColorScheme', () => {
  it('isPrefersColorScheme detect @media prefers-color-scheme', () => {
    const mediaRules = [
      { key: '(prefers-color-scheme: dark)', data: {} },
      { key: '(prefers-color-scheme: light)', data: {} },
      { key: 'screen and (max-width: 300px)', data: {} }
    ];
    expect(isPrefersColorScheme(mediaRules[0].key)).toBe(true);
    expect(isPrefersColorScheme(mediaRules[1].key)).toBe(true);
    expect(isPrefersColorScheme(mediaRules[2].key)).toBe(false);
  });

  it('processPrefersColorScheme compile weex to `-weex-xxx-scheme-xxx`', () => {
    const mediaRules = [
      {
        key: '(prefers-color-scheme: dark)', data: {
          test: { color: 'rgb(0,0,0)' }
        }
      },
      {
        key: '(prefers-color-scheme: light)', data: {
          test: { color: 'rgb(255,255,255)' }
        }
      },
    ];

    const webResult = processPrefersColorScheme(mediaRules, {}, 'web');
    const weexResult = processPrefersColorScheme(mediaRules, {}, 'weex');

    // do nothing in web
    expect(webResult).toEqual({});
    expect(weexResult).toMatchObject({
      test: {
        '-weex-dark-scheme-color': 'rgb(0,0,0)',
        '-weex-light-scheme-color': 'rgb(255,255,255)'
      }
    });
  });
});
