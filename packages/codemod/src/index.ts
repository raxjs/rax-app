import * as meow from 'meow';
import checkGitStatus from './utils/checkGitStatus';
import expandFilePathsIfNeeded from './utils/expandFilePathsIfNeeded';

export default function run() {
  const cli = meow(
    {
      description: 'Codemods for updating Rax App.',
      help: `
    Usage
      $ npx rax-app-codemod <transform> <path> <...options>
        transform    One of the choices from https://github.com/raxjs/
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
}
