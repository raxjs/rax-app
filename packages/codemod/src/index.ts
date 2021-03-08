import * as meow from 'meow';
import * as path from 'path';
import * as execa from 'execa';
import checkGitStatus from './utils/checkGitStatus';
import expandFilePathsIfNeeded from './utils/expandFilePathsIfNeeded';

const transformerDirectory = path.join(__dirname, '../lib', 'transforms');
const jscodeshiftExecutable = require.resolve('.bin/jscodeshift');
const baseIgnorePattern = 'node_modules/**|.vscode/**|abc.json';
export default function run() {
  const cli = meow(
    {
      description: 'Codemods for updating Rax App.',
      help: `
    Usage
      $ npx rax-app-codemod <transform> <path> <...options>
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

  const selectedTransformer = cli.input[0] || 'project';

  if (!filesExpanded.length) {
    console.log(`No files found matching ${filesBeforeExpansion.join(' ')}`);
    return null;
  }
  console.log('cli.flags=====>', cli.flags);
  console.log('selectedTransformer====>', selectedTransformer);
  console.log('filesExpanded====>', filesExpanded);

  return runTransform({
    files: filesExpanded,
    flags: cli.flags,
    transformer: selectedTransformer,
  });
}

function runTransform({ files, flags, transformer }) {
  const transformerPath = path.join(transformerDirectory, `${transformer}.js`);

  let args = [];

  const { dry, print, explicitRequire } = flags;

  if (dry) {
    args.push('--dry');
  }
  if (print) {
    args.push('--print');
  }

  if (explicitRequire === 'false') {
    args.push('--explicit-require=false');
  }

  args.push('--verbose=2');

  args.push('--extensions=tsx,ts,jsx,js,json');

  args = args.concat(['--transform', transformerPath]);

  if (transformer === 'project') {
    args.push('--project=true');
    args.push(`--ignore-pattern=(${baseIgnorePattern}|src/!(app.json))`);
  } else {
    args.push(`--ignore-pattern=(${baseIgnorePattern})`);
  }

  if (flags.jscodeshift) {
    args = args.concat(flags.jscodeshift);
  }

  args = args.concat(files);

  console.log(`Executing command: jscodeshift ${args.join(' ')}`);

  execa.sync(jscodeshiftExecutable, args, {
    stdio: 'inherit',
  });
}
