import * as path from 'path';
import { cloneDeep } from '@builder/pack/deps/lodash';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { IOptions } from './types';
import isWebpack4 from './isWebpack4';

const URL_LOADER_LIMIT = 8192;
const EXCLUDE_REGX = /node_modules/;
// config css rules
const configCSSRule = (config, style) => {
  const cssModuleReg = new RegExp(`\\.module\\.${style}$`);
  const styleReg = new RegExp(`\\.${style}$`);

  // add both rule of css and css module
  ['css', 'module'].forEach((type) => {
    if (type === 'module') {
      createCSSRule(config, `${style}-module`, cssModuleReg, []);
    } else {
      createCSSRule(config, style, styleReg, [cssModuleReg]);
    }
  });
};

export const createCSSRule = (config, ruleName, reg, excludeRegs = []) => {
  const isCSSModule = /\-module$/.test(ruleName);
  const extName = ruleName.replace(/\-(module|global)$/, '');
  const rule = config.module.rule(ruleName).test(reg);

  excludeRegs.forEach((excludeReg) => {
    rule.exclude.add(excludeReg);
  });

  addExtractLoader(rule);
  addCssLoader(rule, isCSSModule);
  addPostCssLoader(rule);

  const sassLoader = isWebpack4 ? require.resolve('@builder/rax-pack/deps/sass-loader') : require.resolve('@builder/pack/deps/sass-loader');
  const lessLoader = isWebpack4 ? require.resolve('@builder/rax-pack/deps/less-loader') : require.resolve('@builder/pack/deps/less-loader');

  const loaderMap = {
    css: [],
    scss: [['sass-loader', sassLoader]],
    less: [['less-loader', lessLoader, { lessOptions: { javascriptEnabled: true } }]],
  };

  loaderMap[extName].forEach((loader) => {
    addCssPreprocessorLoader(rule, loader);
  });

  return rule;
};

const addExtractLoader = (rule) => {
  return rule
    .use('MiniCssExtractPlugin.loader')
    .loader(MiniCssExtractPlugin.loader)
    .options({
      esModule: false,
    })
    .end();
};

const addCssLoader = (rule, isCSSModule) => {
  const cssLoaderOpts = {
    sourceMap: true,
  };

  const cssModuleLoaderOpts = {
    ...cssLoaderOpts,
    modules: {
      localIdentName: '[folder]--[local]--[hash:base64:7]',
    },
  };

  const cssLoader = isWebpack4 ? require.resolve('@builder/rax-pack/deps/css-loader') : require.resolve('@builder/pack/deps/css-loader');

  return rule
    .use('css-loader')
    .loader(cssLoader)
    .options(isCSSModule ? cssModuleLoaderOpts : cssLoaderOpts)
    .end();
};

const addPostCssLoader = (rule) => {
  const postcssLoader = isWebpack4 ? require.resolve('@builder/rax-pack/deps/postcss-loader') : require.resolve('@builder/pack/deps/postcss-loader');
  return rule.use('postcss-loader').loader(postcssLoader).options({ sourceMap: true }).end();
};

const addCssPreprocessorLoader = (rule, loader) => {
  const [loaderName, loaderPath, loaderOpts = {}] = loader;

  return rule
    .use(loaderName)
    .loader(loaderPath)
    .options({ sourceMap: true, ...loaderOpts })
    .end();
};

const configAssetsRule = (config, type, testReg, loaderOpts = {}) => {
  config.module
    .rule(type)
    .test(testReg)
    .use(type)
    .loader(require.resolve('url-loader'))
    .options({
      name: '[hash].[ext]',
      limit: URL_LOADER_LIMIT,
      ...loaderOpts,
    });
};

export default (config, { rootDir, babelConfig }: IOptions) => {
  config.resolve.alias
    .set('babel-runtime-jsx-plus', require.resolve('babel-runtime-jsx-plus'))
    // @babel/runtime has no index
    .set('@babel/runtime', path.dirname(require.resolve('@babel/runtime/package.json')));

  config.target('web');
  config.context(rootDir);
  config.externals([
    function (...args) {
      let request;
      let callback;
      if (isWebpack4) {
        [, request, callback] = args;
      } else {
        request = args[0].request;
        callback = args[1];
      }

      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      // compatible with @system for quickapp
      if (request.indexOf('@system') !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      // compatible with plugin with miniapp plugin
      if (/^plugin\:\/\//.test(request)) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ]);

  // css loader
  ['css', 'scss', 'less'].forEach((style) => {
    configCSSRule(config, style);
  });

  [
    ['woff2', /\.woff2?$/, { mimetype: 'application/font-woff' }],
    ['ttf', /\.ttf$/, { mimetype: 'application/octet-stream' }],
    ['eot', /\.eot$/, { mimetype: 'application/vnd.ms-fontobject' }],
    ['svg', /\.svg$/, { mimetype: 'image/svg+xml' }],
    ['img', /\.(png|jpg|jpeg|gif)$/i],
  ].forEach(([type, reg, opts]) => {
    configAssetsRule(config, type, reg, opts || {});
  });

  const babelLoader = require.resolve('@builder/pack/deps/babel-loader');

  config.module
    .rule('jsx')
    .test(/\.jsx?$/)
    .exclude.add(EXCLUDE_REGX)
    .end()
    .use('babel-loader')
    .loader(babelLoader)
    .options(cloneDeep(babelConfig));

  config.module
    .rule('tsx')
    .test(/\.tsx?$/)
    .exclude.add(EXCLUDE_REGX)
    .end()
    .use('babel-loader')
    .loader(babelLoader)
    .options(cloneDeep(babelConfig))
    .end()
    .use('ts-loader')
    .loader(require.resolve('ts-loader'))
    .options({ transpileOnly: true });

  return config;
};
