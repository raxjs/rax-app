const rollup = require('rollup');
const memory = require('rollup-plugin-memory');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify').uglify;
const replace = require('rollup-plugin-replace');
const gzipSize = require('gzip-size');
const path = require('path');

function getExtension(format) {
  let ext = '.js';
  switch (format) {
    case 'esm': ext = '.mjs';
      break;
  }
  return ext;
}

async function build({ rootDir, entry = 'src/index.ts', shouldMinify = false, format = 'cjs', outDir = 'lib'}) {
  const output = {
  };
  const input = entry;
  // For development
  const bundle = await rollup.rollup({
    input,
    plugins: [
      typescript({
        exclude: 'node_modules/**',
        typescript: require('typescript'),
      }),
      resolve(),
      commonjs({
        // style-unit for build while packages linked
        // use /pakacges/ would get error and it seemed to be a rollup-plugin-commonjs bug
        include: /(node_modules|style-unit)/,
      }),
      babel({
        exclude: 'node_modules/**', // only transpile our source code
        presets: [
          ['@babel/preset-env', {
            modules: false,
            loose: true,
            targets: {
              browsers: ['last 2 versions', 'IE >= 9']
            }
          }]
        ],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(shouldMinify ? 'production' : 'development'),
      }),
      shouldMinify ? uglify({
        compress: {
          loops: false,
          keep_fargs: false,
          unsafe: true,
          pure_getters: true
        }
      }) : null
    ]
  });

  if (shouldMinify) {
    const file = path.join(rootDir, outDir, 'index.min.js');
    await bundle.write({
      ...output,
      format,
      file,
    });

    const size = gzipSize.fileSync(file, {
      level: 6
    });

    console.log(file, `${(size / 1024).toPrecision(3)}kb (gzip)`);
  } else {
    const ext = getExtension(format);
    await bundle.write({
      ...output,
      format,
      file: path.join(rootDir, outDir, `index${ext}`),
    });
  }
}

module.exports = build;
