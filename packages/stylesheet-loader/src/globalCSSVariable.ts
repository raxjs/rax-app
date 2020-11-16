import normalizeColor from './normalizeColor';
import colorProperties from './colorProperties';

export default function getGlobalCSSVariable(config) {
  const { styles, globalCSSVarName } = config;
  let globalCSSVariable = `let __globalObject = typeof window === 'object' ? window : typeof global === 'object' ? global : {};
  if (typeof __globalObject === "object") {
    __globalObject.__RootCSSVariable = __globalObject.__RootCSSVariable || {};`;
  // eslint-disable
  for (const key in styles) {
    if (key === globalCSSVarName && typeof styles[key] === 'object') {
      // eslint-disable-next-line guard-for-in
      for (const name in styles[key]) {
        let styleValue;
        if (colorProperties[name]) {
          styleValue = normalizeColor(styles[key][name]);
        } else {
          styleValue = styles[key][name];
        }
        globalCSSVariable += `__globalObject.__RootCSSVariable["${ name }"] = "${ styleValue }";`;
      }
    }
  }
  globalCSSVariable += `}
  function __getValue(name){
    return (typeof __globalObject.__RootCSSVariable === "object")
      ? window.__RootCSSVariable[name]
      : "";
  }`;
  return globalCSSVariable;
}
