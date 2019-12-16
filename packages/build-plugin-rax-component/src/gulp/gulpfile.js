const fs = require('fs-extra');
const path = require('path');
const { src, dest, series, parallel, watch } = require('gulp');
const babel = require('gulp-babel');
const ts = require('gulp-typescript');
const { getBabelConfig } = require('rax-compile-config');

const {
  JS_FILES_PATTERN,
  TS_FILES_PATTERN,
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

const {
  api,
  compileMiniappTS,
  compileAliMiniappTS,
  compileWechatMiniProgramTS,
  callback = done => {
    done();
  },
} = params;

const { context, log } = api;
const { rootDir, userConfig, command } = context;
const { outputDir, devOutputDir } = userConfig;

const isDev = command === 'dev';

const enableTypescript = fs.existsSync(path.join(rootDir, 'tsconfig.json'));

const BUILD_DIR = path.resolve(rootDir, isDev ? devOutputDir : outputDir);

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
  return tsProject
    .src()
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
// for wechat miniprogram build
const buildWechatTemp = path.resolve(rootDir, outputDir, 'wechatTemp');

function miniappClean(filePath) {
  return function(done) {
    log.info('component', `Cleaning build directory ${filePath}`);
    fs.removeSync(filePath);
    log.info('component', 'Build directory has been Cleaned');
    done();
  };
}

const miniappTsProject = ts.createProject('tsconfig.json', {
  skipLibCheck: true,
  declaration: true,
  declarationDir: BUILD_DIR,
  outDir: BUILD_DIR,
});

//  build ts/tsx to miniapp
function miniappTs(filePath, target = 'ali miniapp') {
  return function() {
    log.info('component', `Compiling typescript files for ${target}`);
    return miniappTsProject
      .src()
      .pipe(miniappTsProject())
      .pipe(dest(filePath))
      .on('end', () => {
        log.info('component', 'Typescript files have been compiled');
      });
  };
}

function miniappCopyOther(filePath, target = 'ali miniapp') {
  return function() {
    log.info('component', `Copy other files for ${target}`);
    return src([OTHER_FILES_PATTERN], { ignore: IGNORE_PATTERN })
      .pipe(dest(filePath))
      .on('end', () => {
        log.info('component', 'Other Files have been copied');
      });
  };
}

if (isDev) {
  watch([JS_FILES_PATTERN], { ignore: IGNORE_PATTERN }, compileJs);
  watch([OTHER_FILES_PATTERN], { ignore: IGNORE_PATTERN }, copyOther);

  if (enableTypescript) {
    watch([TS_FILES_PATTERN], { ignore: IGNORE_PATTERN }, compileTs);
  }
  log.info('component', 'Watching file changes');
}

let tasks = [clean, parallel(compileJs, copyOther)];

if (enableTypescript) {
  tasks = [clean, parallel(compileJs, compileTs, copyOther)];
}

if (compileMiniappTS) {
  if (compileAliMiniappTS) {
    tasks = [
      miniappClean(buildTemp),
      parallel(miniappTs(buildTemp), miniappCopyOther(buildTemp)),
    ];
  } else {
    tasks = [];
  }

  if (compileWechatMiniProgramTS) {
    tasks = [
      ...tasks,
      miniappClean(buildWechatTemp),
      parallel(miniappTs(buildWechatTemp), miniappCopyOther(buildWechatTemp)),
    ];
  }
}

exports.default = series(...tasks, callback);
