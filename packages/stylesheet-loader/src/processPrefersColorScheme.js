// Support to use a light or dark color theme.
// https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
// Usage:
// ```css
// body { background-color: #ffffff; }
// @media (prefers-color-scheme: dark) {
//   body { background-color: #000000; }
// }
// @media (prefers-color-scheme: light) {
//   body { background-color: #ffffff; }
// }
// ```
// It's works in web app whether it with inline stlye.
// Weex project need compile to `-weex-dark-scheme-xxx` and `-weex-light-scheme-xxx`, like:
// ```css
// body {
//   background-color: #ffffff;
//   -weex-dark-scheme-background-color: #000000;
//   -weex-light-scheme-background-color: #ffffff;
// }
// ```

const PREFERS_COLOR_SCHEME_REG = /prefers-color-scheme:\s?([\S]+[^\s)])/;

export function isPrefersColorScheme(mediaKey) {
  return PREFERS_COLOR_SCHEME_REG.test(mediaKey || '');
}

export function processPrefersColorScheme(mediaRules, styles, taskName = 'web') {
  mediaRules.forEach((rule) => {
    if (taskName === 'weex' && isPrefersColorScheme(rule.key)) {
      for (var className in rule.data) {
        for (var key in rule.data[className]) {
          if (!styles[className]) {
            styles[className] = {};
          }
          styles[className][`-weex-${rule.key.match(PREFERS_COLOR_SCHEME_REG)[1]}-scheme-${key}`] = rule.data[className][key];
        }
      }
    }
  });
  return styles;
}
