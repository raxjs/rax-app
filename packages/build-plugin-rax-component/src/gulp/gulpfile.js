const fs = require('fs-extra');
const path = require('path');
const { src, dest, series, parallel, watch } = require('gulp');
const babel = require('gulp-babel');
const ts = require('gulp-typescript');
const getBabelConfig = require('rax-babel-config');

const {
  JS_FILES_PATTERN,
  TS_FILES_PATTERN,
  OTHER_FILES_PATTERN,
  IGNORE_PATTERN,
} = require('./filePatterns');

const params = require('./params');

const babelOptions = {
  styleSheet: true,
  custom: {
    ignore: ['**/**/*.d.ts'],
  },
};
const babelConfig = getBabelConfig({
  ...babelOptions
});
const esBabelConfig = getBabelConfig({
  ...babelOptions,
  modules: false,
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
const { esOutputDir = 'es', typesOutputDir = 'lib' } = options;

const isDev = command === 'dev';

const enableTypescript = fs.existsSync(path.join(rootDir, 'tsconfig.json'));

const LIB_DIR = path.resolve(rootDir, isDev ? devOutputDir : outputDir);
const TYPES_DIR = path.resolve(rootDir, typesOutputDir);
const ES_DIR = esOutputDir ? path.resolve(rootDir, esOutputDir) : '';

function clean(done) {
  fs.removeSync(LIB_DIR);
  if (ES_DIR) {
    fs.removeSync(ES_DIR);
  }
  if (fs.pathExistsSync(TYPES_DIR)) {
    fs.removeSync(TYPES_DIR);
  }
  done();
}

// for js/jsx.
function compileJs() {
  return src([JS_FILES_PATTERN], { ignore: IGNORE_PATTERN })
    .pipe(babel(babelConfig))
    .pipe(dest(LIB_DIR));
}

function compileJS2ES() {
  if (!ES_DIR) {
    return src('.');
  }

  return src([JS_FILES_PATTERN], { ignore: IGNORE_PATTERN })
    .pipe(babel(esBabelConfig))
    .pipe(dest(ES_DIR));
}

const tsProject = ts.createProject('tsconfig.json', {
  skipLibCheck: true,
  outDir: LIB_DIR,
});

// for ts/tsx.
function compileTs() {
  return tsProject
    .src()
    .pipe(tsProject())
    .pipe(babel(babelConfig))
    .pipe(dest(LIB_DIR));
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
    .pipe(dest(TYPES_DIR));
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
    .pipe(dest(ES_DIR));
}

function copyOther() {
  return src([OTHER_FILES_PATTERN], { ignore: IGNORE_PATTERN })
    .pipe(dest(LIB_DIR));
}

if (isDev) {
  watch([JS_FILES_PATTERN], { ignore: IGNORE_PATTERN }, compileJs);
  watch([OTHER_FILES_PATTERN], { ignore: IGNORE_PATTERN }, copyOther);

  if (enableTypescript) {
    watch([TS_FILES_PATTERN], { ignore: IGNORE_PATTERN }, compileTs);
  }
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
