export default function (fileInfo, api) {
  const { jscodeshift } = api;
  const ast = jscodeshift(fileInfo.source);
  ast
    .find(jscodeshift.ImportDeclaration)
    .filter((path) => path.value.source.value === './app.json')
    .forEach((path) => {
      path.prune();
    });

  ast
    .find(jscodeshift.Identifier)
    .filter((path) => path.value.name === 'appConfig')
    .remove();

  return ast.toSource();
}
