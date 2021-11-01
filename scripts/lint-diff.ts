import { execSync } from 'child_process';
import { CLIEngine as ESLint } from 'eslint';
import chalk from 'chalk';

const GIT_DIFF = 'git diff --cached --diff-filter=ACMR --name-only';

(async () => {
  const linter = new ESLint({ extensions: ['.js', '.jsx', '.ts', '.tsx'] });

  // file level
  const fileList = await execSync(GIT_DIFF).toString().split('\n');

  // ignore file which is not js/jsx/ts/tsx
  const lintFileList = fileList.filter((file) => /\.(j|t)sx?$/g.test(file) && !linter.isPathIgnored(file));

  if (!lintFileList.length) {
    console.log(chalk.green('no file should be lint.'));
    return;
  }

  try {
    console.log(chalk.green(lintFileList.join('\n')));
    console.log();
    console.log(chalk.green('above file should be lint.'));
    const report = linter.executeOnFiles(lintFileList);
    const formatter = linter.getFormatter();
    console.log(formatter(report.results));
  } catch (error) {
    process.exit(1);
  }
})().catch((e) => {
  console.trace(e);
  process.exit(1);
});
