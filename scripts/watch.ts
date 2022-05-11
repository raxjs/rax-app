/* eslint @typescript-eslint/explicit-function-return-type:0, no-shadow: 0 */
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs-extra';
import { watch } from 'chokidar';
import { run } from './fn/shell';

let watcher;

(async () => {
  await run('npm run clean');

  const fileParten = '*/src/**/!(*.ts|*.tsx)';
  console.log(`[COPY]: ${fileParten}`);

  const cwd = path.join(__dirname, '../packages');
  const files = glob.sync(fileParten, { cwd, nodir: true });
  const fileSet = new Set();
  /* eslint no-restricted-syntax:0 */
  for (const file of files) {
    /* eslint no-await-in-loop:0 */
    await copyOneFile(file, cwd);
    fileSet.add(path.join(cwd, file));
  }

  const watcher = await watch(cwd, {
    ignored: [/lib\//],
    ignoreInitial: true,
  });

  watcher.on('add', reactFileChange.bind(null, cwd));
  watcher.on('change', reactFileChange.bind(null, cwd));

  await run('npx tsc --build ./tsconfig.json -w');
})().catch(async (e) => {
  console.trace(e);
  await watcher?.close();
  process.exit(128);
});

async function copyOneFile(file, cwd) {
  const from = path.join(cwd, file);
  const to = path.join(cwd, file.replace(/\/src\//, '/lib/'));
  await fs.copy(from, to, {
    overwrite: true,
  });
}

function reactFileChange(cwd, file) {
  if (!/\.tsx?$/.test(file)) {
    copyOneFile(path.relative(cwd, file), cwd);
  }
}
