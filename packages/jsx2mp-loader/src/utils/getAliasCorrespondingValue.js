const { join, isAbsolute, relative, dirname } = require('path');

const ALIAS_TYPE = {
  // react -> rax
  MODULE: 1,
  // @component/comp.jsx -> /User/name/code/src/component/comp.jsx
  PATH: 2,
  // @components -> /User/name/code/src/component
  COMPLEX_PATH: 3
};

function getAliasType(aliasEntries, importedModule) {
  if (aliasEntries[importedModule]) {
    if (isAbsolute(aliasEntries[importedModule])) {
      return [ALIAS_TYPE.PATH];
    } else {
      return [ALIAS_TYPE.MODULE];
    }
  }

  let correspondingAlias = '';
  const useComplexPath = Object.keys(aliasEntries).some(alias => {
    if (importedModule.startsWith(alias) && importedModule[alias.length] === '/') {
      correspondingAlias = alias;
      return true;
    }
  });
  if (useComplexPath) return [ALIAS_TYPE.COMPLEX_PATH, correspondingAlias];
  return [];
}

function getAliasCorrespondingValue(aliasEntries = {}, value = '', resourcePath = '') {
  const [ aliasType, correspondingAlias ] = getAliasType(aliasEntries, value);
  if (aliasType) {
    let replacedValue;
    switch (aliasType) {
      case ALIAS_TYPE.MODULE:
        // e.g. react -> rax
        replacedValue = aliasEntries[value];
        break;
      case ALIAS_TYPE.PATH:
        // e.g. @logo -> ../components/Logo (alias: @logo -> src/components/Logo)
        replacedValue = relative(dirname(resourcePath), aliasEntries[value]);
        break;
      case ALIAS_TYPE.COMPLEX_PATH:
        // e.g. @components/Logo -> ../components/logo (alias: @components -> src/components)
        const realAbsolutePath = join(aliasEntries[correspondingAlias], value.replace(correspondingAlias, ''));
        replacedValue = './' + relative(dirname(resourcePath), realAbsolutePath); // Add relative path in case the path is recognized as npm package
        break;
    }
    return replacedValue;
  }
  return null;
}

module.exports = getAliasCorrespondingValue;
