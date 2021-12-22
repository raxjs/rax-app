/* eslint-disable no-useless-return */
import chalk from 'chalk';
import generate from '@babel/generator';

let errored = false;

function validatePlugin() {
  return {
    visitor: {
      ClassDeclaration(path, { filename }) {
        const { node } = path;
        if (!/\.tsx?$/.test(filename) || !node.superClass) return;
        const propertyDecls = node.body?.body
          ?.filter((member) => member?.type === 'ClassProperty');

        // The uninitialized property such as:
        // text: string;
        const invalidDecl = propertyDecls?.find((decl) => decl.typeAnnotation && !decl.declare && !decl.value);

        if (invalidDecl && !errored) {
          errored = true;
          const { code: generatedCode } = generate(invalidDecl);
          throw new SyntaxError(chalk.red(`\nInvalid type annotation with:
${generatedCode}

Please add declare in front of your property, such as:
class Child extends Parent {
  declare text: string;
}`));
        }
        return;
      },
    },
  };
}

export default (config) => {
  ['jsx', 'tsx'].forEach((rule) => {
    config.module
      .rule(rule)
      .use('babel-loader')
      .tap((options) => {
        const { plugins = [] } = options;
        return {
          ...options,
          plugins: [
            validatePlugin,
            ...plugins,
          ],
        };
      });
  });
};
