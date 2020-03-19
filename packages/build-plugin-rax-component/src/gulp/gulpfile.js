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
  options,
  callback = done => {
    done();
  },
} = params;

const { context, log } = api;
const { rootDir, userConfig, command } = context;
const { outputDir, devOutputDir } = userConfig;
const { esOutputDir = '', typesOutputDir = 'lib' } = options;

const isDev = command === 'dev';

const enableTypescript = fs.existsSync(path.join(rootDir, 'tsconfig.json'));

const LIB_DIR = path.resolve(rootDir, isDev ? devOutputDir : outputDir);
const TYPES_DIR = path.resolve(rootDir, typesOutputDir);
const ES_DIR = esOutputDir ? path.resolve(rootDir, esOutputDir) : '';

function clean(done) {
  log.info('component', `Cleaning lib directory ${LIB_DIR}`);
  fs.removeSync(LIB_DIR);
  if (ES_DIR) {
    log.info('component', `Cleaning es directory ${ES_DIR}`);
    fs.removeSync(ES_DIR);
  }
  if (fs.pathExistsSync(TYPES_DIR)) {
    log.info('component', `Cleaning dts directory ${TYPES_DIR}`);
    fs.removeSync(TYPES_DIR);
  }
  log.info('component', 'Build directory has been Cleaned');
  done();
}

// for js/jsx.
function compileJs() {
  log.info('component', 'Compiling javascript files');
  return src([JS_FILES_PATTERN], { ignore: IGNORE_PATTERN })
    .pipe(babel(babelConfig))
    .pipe(dest(LIB_DIR))
    .on('end', () => {
      log.info('component', 'Javascript files have been compiled');
    });
}

function compileJS2ES() {
  if (!ES_DIR) {
    return src('.');
  }

  log.info('component', 'Compiling javascript files to ES');

  return src([JS_FILES_PATTERN], { ignore: IGNORE_PATTERN })
    .pipe(dest(ES_DIR))
    .on('end', () => {
      log.info('component', 'Javascript files have been compiled to es');
    });
}

const tsProject = ts.createProject('tsconfig.json', {
  skipLibCheck: true,
  outDir: LIB_DIR,
});

// for ts/tsx.
function compileTs() {
  log.info('component', 'Compiling typescript files');
  return tsProject
    .src()
    .pipe(tsProject())
    .pipe(babel(babelConfig))
    .pipe(dest(LIB_DIR))
    .on('end', () => {
      log.info('component', 'Typescript files have been compiled');
    });
}

const tsProject4Dts = ts.createProject('tsconfig.json', {
  skipLibCheck: true,
  declaration: true,
  declarationDir: TYPES_DIR,
});

function compileDts() {
  return tsProject4Dts.src()
    .pipe(tsProject4Dts())
    .dts
    .pipe(dest(TYPES_DIR))
    .on('end', () => {
      log.info('component', 'Declaration files have been generated');
    });
}

const tsProject4ES = ts.createProject('tsconfig.json', {
  skipLibCheck: true,
  outDir: ES_DIR,
});

function compileTS2ES() {
  if (!ES_DIR) {
    return src('.');
  }
  return tsProject4ES.src()
    .pipe(tsProject4ES())
    .pipe(dest(ES_DIR))
    .on('end', () => {
      log.info('component', 'Typescript files have been compiled to es');
    });
}

function copyOther() {
  log.info('component', 'Copy other files');
  return src([OTHER_FILES_PATTERN], { ignore: IGNORE_PATTERN })
    .pipe(dest(LIB_DIR))
    .on('end', () => {
      log.info('component', 'Other Files have been copied');
    });
}

if (isDev) {
  watch([JS_FILES_PATTERN], { ignore: IGNORE_PATTERN }, compileJs);
  watch([OTHER_FILES_PATTERN], { ignore: IGNORE_PATTERN }, copyOther);

  if (enableTypescript) {
    watch([TS_FILES_PATTERN], { ignore: IGNORE_PATTERN }, compileTs);
  }
  log.info('component', 'Watching file changes');
}

let tasks = [compileJs];

if (enableTypescript) {
  tasks = [...tasks, compileDts, compileTs];
}

if (ES_DIR) {
  tasks = [...tasks, compileJS2ES];

  if (enableTypescript) {
    tasks = [...tasks, compileTS2ES];
  }
}

tasks = [clean, parallel(...tasks, copyOther)];

exports.default = series(...tasks, callback);
