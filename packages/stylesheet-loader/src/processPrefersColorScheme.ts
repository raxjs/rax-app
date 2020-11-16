// Support to use a light or dark color theme.
// https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
// Usage:
// ```css
// .test { background-color: #ffffff; }
// @media (prefers-color-scheme: dark) {
//   .test { background-color: #000000; }
// }
// @media (prefers-color-scheme: light) {
//   .test { background-color: #ffffff; }
// }
// ```
// It's works in web app whether it with inline stlye.
// Weex project need compile to `-weex-dark-scheme-xxx` and `-weex-light-scheme-xxx`, like:
// ```css
// .test {
//   background-color: #ffffff;
//   -weex-dark-scheme-background-color: #000000;
//   -weex-light-scheme-background-color: #ffffff;
// }
// ```

const PREFERS_COLOR_SCHEME_REG = /prefers-color-scheme:\s?([light|dark]+[^\s)])/i;

export function isPrefersColorScheme(mediaKey) {
  return PREFERS_COLOR_SCHEME_REG.test(mediaKey || '');
}

export function processPrefersColorScheme(mediaRules, styles = {}, taskName = 'web') {
  mediaRules.forEach((rule) => {
    if (taskName === 'weex' && isPrefersColorScheme(rule.key)) {
      // eslint-disable-next-line guard-for-in
      for (const className in rule.data) {
        for (const key in rule.data[className]) {
          if (/^[a-zA-Z].*$/.test(key)) {
            // Ignore css variables(--color), css hack(_ *) and browser hack (-webkit)
            if (!styles[className]) {
              styles[className] = {};
            }
            styles[className][`-weex-${rule.key.match(PREFERS_COLOR_SCHEME_REG)[1]}-scheme-${key}`] = rule.data[className][key];
          }
        }
      }
    }
  });
  return styles;
}
