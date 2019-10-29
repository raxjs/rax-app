const fs = require('fs-extra');
const path = require('path');
const { src, dest, series, parallel, watch } = require('gulp');
const babel = require('gulp-babel');
const ts = require('gulp-typescript');
const { getBabelConfig } = require('rax-compile-config');

const {
  JS_FILES_PATTERN,
  OTHER_FILES_PATTERN,
  IGNORE_PATTERN,
} = require('./filePatterns');

const params = require('./params');

const babelConfig = getBabelConfig({
  styleSheet: true,
  custom: {
    ignore: ['**/**/*.d.ts'],
  },
});

const { api, options, watch } = params;

const { targets = [] } = options;
const { context, log } = api;
const { rootDir, userConfig } = context;
const { outputDir, devOutputDir } = userConfig;

const enableTypescript = fs.existsSync(path.join(rootDir, 'tsconfig.json'));
const buildMiniapp = ~targets.indexOf('miniapp');

const BUILD_DIR = path.resolve(rootDir, watch ? devOutputDir : outputDir);

function clean(done) {
  log.info('component', `Cleaning build directory ${BUILD_DIR}`);
  fs.removeSync(BUILD_DIR);
  log.info('component', 'Build directory has been Cleaned');
  done();
}

// for js/jsx.
function compileJs() {
  log.info('component', 'Compiling javascript files');
  return src([JS_FILES_PATTERN], { ignore: IGNORE_PATTERN })
    .pipe(babel(babelConfig))
    .pipe(dest(BUILD_DIR))
    .on('end', () => {
      log.info('component', 'Javascript files have been compiled');
    });
}


const tsProject = ts.createProject('tsconfig.json', {
  skipLibCheck: true,
  declaration: true,
  declarationDir: BUILD_DIR,
  outDir: BUILD_DIR,
});

// for ts/tsx.
function compileTs() {
  log.info('component', 'Compiling typescript files');
  return tsProject.src()
    .pipe(tsProject())
    .pipe(babel(babelConfig))
    .pipe(dest(BUILD_DIR))
    .on('end', () => {
      log.info('component', 'Typescript files have been compiled');
    });
}

function copyOther() {
  log.info('component', 'Copy other files');
  return src([OTHER_FILES_PATTERN], { ignore: IGNORE_PATTERN })
    .pipe(dest(BUILD_DIR))
    .on('end', () => {
      log.info('component', 'Other Files have been copied');
    });
}

// for miniapp build
const buildTemp = path.resolve(rootDir, outputDir, 'miniappTemp');

function miniappClean(done) {
  log.info('component', `Cleaning miniapp build directory ${buildTemp}`);
  fs.removeSync(buildTemp);
  log.info('component', 'Build directory has been Cleaned');
  done();
}

const miniappTsProject = ts.createProject('tsconfig.json', {
  skipLibCheck: true,
  declaration: true,
  declarationDir: BUILD_DIR,
  outDir: BUILD_DIR,
});

//  build ts/tsx to miniapp
function miniappTs() {
  log.info('component', 'Compiling typescript files for miniapp');
  return miniappTsProject.src()
    .pipe(miniappTsProject())
    .pipe(dest(buildTemp))
    .on('end', () => {
      log.info('component', 'Typescript files have been compiled');
    });
}

function miniappCopyOther() {
  log.info('component', 'Copy other files for miniapp');
  return src([OTHER_FILES_PATTERN], { ignore: IGNORE_PATTERN })
    .pipe(dest(buildTemp))
    .on('end', () => {
      log.info('component', 'Other Files have been copied');
    });
}

if (watch) { // watch lib
  // if (enableTypescript) {
  //   return [
  //     'clean',
  //     [
  //       'js',
  //       'ts',
  //       'copyOther',
  //     ],
  //   ];
  // }

  // return [
  //   'clean',
  //   [
  //     'js',
  //     'copyOther',
  //   ],
  // ];

} else { // build lib
  let tasks = [
    clean,
    parallel(
      compileJs,
      copyOther,
    ),
  ];

  if (enableTypescript) {
    if (buildMiniapp) {
      tasks = [
        miniappClean,
        parallel(
          miniappTs,
          miniappCopyOther,
        ),
      ];
    }

    tasks = [
      clean,
      parallel(
        compileJs,
        compileTs,
        copyOther,
      ),
    ];
  }

  exports.default = series(...tasks);
}
