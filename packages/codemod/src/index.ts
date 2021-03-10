import * as meow from 'meow';
import * as execa from 'execa';
import * as chalk from 'chalk';
import checkGitStatus from './utils/checkGitStatus';
import expandFilePathsIfNeeded from './utils/expandFilePathsIfNeeded';

const jscodeshiftExecutable = require.resolve('.bin/jscodeshift');
const baseIgnorePattern = '*(node_modules|.vscode|abc.json|.rax|build)';
export default function run() {
  const cli = meow(
    {
      description: 'Codemods for updating Rax.',
      help: `
    Usage
      $ npx rax-codemod <transform> <path> <...options>
        transform    One of the choices from https://github.com/raxjs/blob/master/packages/codemod
        path         Files or directory to transform. Can be a glob like src/**.test.js
    Options
      --force            Bypass Git safety checks and forcibly run codemods
      --dry              Dry run (no changes are made to files)
      --print            Print transformed files to your terminal
      --jscodeshift  (Advanced) Pass options directly to jscodeshift
    `,
    },
    {
      boolean: ['force', 'dry', 'print', 'help'],
      string: ['_'],
      alias: {
        h: 'help',
      },
    },
  );

  if (!cli.flags.dry) {
    checkGitStatus(cli.flags.force);
  }

  const filesBeforeExpansion = cli.input[1] || '.';
  const filesExpanded = expandFilePathsIfNeeded([filesBeforeExpansion]);

  const selectedTransformer = cli.input[0] || 'app';

  if (!filesExpanded.length) {
    console.log(`No files found matching ${filesBeforeExpansion.join(' ')}`);
    return null;
  }

  return loadTransform({
    files: filesExpanded,
    flags: cli.flags,
    transformer: selectedTransformer,
  });
}

function loadTransform(options) {
  const { transformer } = options;
  const { beforeTransform, afterTransform } = require(`./hooks/${transformer}`);
  return runTransform({
    ...options,
    beforeTransform,
    afterTransform,
  });
}

function runTransform(options) {
  const { files, flags, beforeTransform, afterTransform } = options;

  let args = [];

  const { dry, print, explicitRequire } = flags;
  if (!dry) {
    args.push('--dry');
  }
  if (!print) {
    args.push('--print');
  }

  if (explicitRequire === 'false') {
    args.push('--explicit-require=false');
  }

  args.push('--verbose=2');

  args.push('--extensions=tsx,ts,jsx,js,json');

  args.push(`--ignore-pattern=${baseIgnorePattern}`);

  args = beforeTransform(args, options).args;

  if (flags.jscodeshift) {
    args = args.concat(flags.jscodeshift);
  }

  args = args.concat(files);

  execa.sync(jscodeshiftExecutable, args, {
    stdio: 'inherit',
  });

  console.log();

  afterTransform(options);

  console.log();
  console.log(
    chalk.green(
      'Thanks for using rax-codemod, if you have any problem after migrating Rax related project, report it by https://github.com/alibaba/rax/issues.',
    ),
  );
}
