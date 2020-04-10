import normalizeColor from './normalizeColor';
import colorProperties from './colorProperties';

export default function getGlobalCSSVariable(config) {
  let { styles, globalCSSVarName } = config;
  let globalCSSVariable = `let __globalObject = typeof window === 'object' ? window : typeof global === 'object' ? global : {};
  if (typeof __globalObject === "object") {
    __globalObject.__RootCSSVariable = __globalObject.__RootCSSVariable || {};`;
  for (let key in styles) {
    if (key === globalCSSVarName && typeof styles[key] === 'object') {
      for (let name in styles[key]) {
        let styleValue;
        if (colorProperties[name]) {
          styleValue = normalizeColor(styles[key][name]);
        } else {
          styleValue = styles[key][name];
        }
        globalCSSVariable += '__globalObject.__RootCSSVariable["' + name + '"] = "' + styleValue + '";';
      }
    }
  }
  globalCSSVariable += `}
  function __getValue(name){
    return (typeof __globalObject.__RootCSSVariable === "object")
      ? window.__RootCSSVariable[name]
      : "";
  }
  `;
  return globalCSSVariable;
};