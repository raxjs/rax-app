import * as meow from 'meow';


export default function run() {
  // const cli = meow(
  //   {
  //     description: 'Codemods for updating Rax App.',
  //     help: `
  //   Usage
  //     $ npx rax-app-codemod <transform> <path> <...options>
  //       transform    One of the choices from https://github.com/raxjs/
  //       path         Files or directory to transform. Can be a glob like src/**.test.js
  //   Options
  //     --force            Bypass Git safety checks and forcibly run codemods
  //     --dry              Dry run (no changes are made to files)
  //     --print            Print transformed files to your terminal
  //     --explicit-require Transform only if React is imported in the file (default: true)
  //     --jscodeshift  (Advanced) Pass options directly to jscodeshift
  //   `
  //   },
  //   {
  //     boolean: ['force', 'dry', 'print', 'explicit-require', 'help'],
  //     string: ['_'],
  //     alias: {
  //       h: 'help'
  //     }
  //   }
  // );

  // if (!cli.flags.dry) {
  //   checkGitStatus(cli.flags.force);
  // }

  // if (
  //   cli.input[0] &&
  //   !TRANSFORMER_INQUIRER_CHOICES.find(x => x.value === cli.input[0])
  // ) {
  //   console.error('Invalid transform choice, pick one of:');
  //   console.error(
  //     TRANSFORMER_INQUIRER_CHOICES.map(x => '- ' + x.value).join('\n')
  //   );
  //   process.exit(1);
  // }

  // inquirer
  //   .prompt([
  //     {
  //       type: 'input',
  //       name: 'files',
  //       message: 'On which files or directory should the codemods be applied?',
  //       when: !cli.input[1],
  //       default: '.',
  //       // validate: () =>
  //       filter: files => files.trim()
  //     },
  //     {
  //       type: 'list',
  //       name: 'parser',
  //       message: 'Which dialect of JavaScript do you use?',
  //       default: 'babel',
  //       when: !cli.flags.parser,
  //       pageSize: PARSER_INQUIRER_CHOICES.length,
  //       choices: PARSER_INQUIRER_CHOICES
  //     },
  //     {
  //       type: 'list',
  //       name: 'transformer',
  //       message: 'Which transform would you like to apply?',
  //       when: !cli.input[0],
  //       pageSize: TRANSFORMER_INQUIRER_CHOICES.length,
  //       choices: TRANSFORMER_INQUIRER_CHOICES
  //     },
  //     // if transformer === 'class'
  //     {
  //       type: 'confirm',
  //       name: 'classFlow',
  //       when: answers => {
  //         return cli.input[0] === 'class' || answers.transformer === 'class';
  //       },
  //       message: 'Generate Flow annotations from propTypes?',
  //       default: true
  //     },
  //     {
  //       type: 'confirm',
  //       name: 'classRemoveRuntimePropTypes',
  //       when: answers => {
  //         return answers.classFlow === true;
  //       },
  //       message: 'Remove runtime PropTypes?',
  //       default: false
  //     },
  //     {
  //       type: 'confirm',
  //       name: 'classPureComponent',
  //       when: answers => {
  //         return cli.input[0] === 'class' || answers.transformer === 'class';
  //       },
  //       message:
  //         'replace react-addons-pure-render-mixin with React.PureComponent?',
  //       default: true
  //     },
  //     {
  //       type: 'input',
  //       name: 'classMixinModuleName',
  //       when: answers => {
  //         return answers.classPureComponent === true;
  //       },
  //       // validate: () =>
  //       message: 'What module exports this mixin?',
  //       default: 'react-addons-pure-render-mixin',
  //       filter: x => x.trim()
  //     },
  //     // if transformer === 'pure-render-mixin'
  //     {
  //       type: 'input',
  //       name: 'pureRenderMixinMixinName',
  //       when: answers => {
  //         return (
  //           cli.input[0] === 'pure-render-mixin' ||
  //           answers.transformer === 'pure-render-mixin'
  //         );
  //       },
  //       message: 'What is the name of the mixin?',
  //       default: 'PureRenderMixin',
  //       filter: x => x.trim()
  //     },
  //     // if transformer === 'pure-component'
  //     {
  //       type: 'confirm',
  //       name: 'pureComponentUseArrows',
  //       when: answers => {
  //         return (
  //           cli.input[0] === 'pure-component' ||
  //           answers.transformer === 'pure-component'
  //         );
  //       },
  //       message: 'Use arrow functions?',
  //       default: false
  //     },
  //     {
  //       type: 'confirm',
  //       name: 'pureComponentDestructuring',
  //       when: answers => {
  //         return (
  //           cli.input[0] === 'pure-component' ||
  //           answers.transformer === 'pure-component'
  //         );
  //       },
  //       message: 'Destructure props?',
  //       default: false
  //     },
  //     {
  //       type: 'confirm',
  //       name: 'destructureNamespaceImports',
  //       when: answers => {
  //         return (
  //           cli.input[0] === 'update-react-imports' ||
  //           answers.transformer === 'update-react-imports'
  //         );
  //       },
  //       message: 'Destructure namespace imports (import *) too?',
  //       default: false
  //     }
  //   ])
  //   .then(answers => {
  //     const { files, transformer, parser } = answers;

  //     const filesBeforeExpansion = cli.input[1] || files;
  //     const filesExpanded = expandFilePathsIfNeeded([filesBeforeExpansion]);

  //     const selectedTransformer = cli.input[0] || transformer;
  //     const selectedParser = cli.flags.parser || parser;

  //     if (!filesExpanded.length) {
  //       console.log(
  //         `No files found matching ${filesBeforeExpansion.join(' ')}`
  //       );
  //       return null;
  //     }

  //     return runTransform({
  //       files: filesExpanded,
  //       flags: cli.flags,
  //       parser: selectedParser,
  //       transformer: selectedTransformer,
  //       answers: answers
  //     });
  //   });
}
