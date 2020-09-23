const path = require('path');
const deepClone = require('lodash.clonedeep');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const URL_LOADER_LIMIT = 8192;
const EXCLUDE_REGX = /node_modules/;
// config css rules
const configCSSRule = (config, style, mode, loaders = [], target) => {
  const cssModuleReg = new RegExp(`\\.module\\.${style}$`);
  const styleReg = new RegExp(`\\.${style}$`);
  const cssLoaderOpts = {
    sourceMap: true,
  };

  const cssModuleLoaderOpts = {
    ...cssLoaderOpts,
    modules: {
      localIdentName: '[folder]--[local]--[hash:base64:7]',
    },
  };

  // add both rule of css and css module
  ['css', 'module'].forEach((ruleKey) => {
    let rule;
    if (ruleKey === 'module') {
      rule = config.module.rule(`${style}-module`)
        .test(cssModuleReg);
    } else {
      rule = config.module.rule(style)
        .test(styleReg)
          .exclude.add(cssModuleReg).end();
    }

    if (mode === 'development' && target === 'web') {
      const cssHotLoader = rule.use('css-hot-loader')
        .loader(require.resolve('css-hot-loader'));
      if (ruleKey === 'module') {
        // https://www.npmjs.com/package/css-hot-loader#cssmodule
        // TODO: now the mini-css-extract-plugin support css hot reload (since 0.6.x)
        // use hmr option instead of css-hot-loader after mini-css-extract-plugin support css-modules hmr
        cssHotLoader.tap(() => ({ cssModule: true }));
      }
    }
    rule
      .use('MiniCssExtractPlugin.loader')
        .loader(MiniCssExtractPlugin.loader)
        .end()
      .use('css-loader')
        .loader(require.resolve('css-loader'))
        .options(ruleKey === 'module' ? cssModuleLoaderOpts : cssLoaderOpts)
        .end()
      .use('postcss-loader')
        .loader(require.resolve('postcss-loader'))
        .options({ ...cssLoaderOpts });

    loaders.forEach((loader) => {
      const [loaderName, loaderPath, loaderOpts = {}] = loader;
      rule.use(loaderName)
        .loader(loaderPath)
        .options({ ...cssLoaderOpts, ...loaderOpts });
    });
  });
};

const configAssetsRule = (config, type, testReg, loaderOpts = {}) => {
  config.module.rule(type).test(testReg).use(type)
    .loader(require.resolve('url-loader'))
    .options({
      name: '[hash].[ext]',
      limit: URL_LOADER_LIMIT,
      ...loaderOpts,
    });
};

module.exports = (config, { rootDir, mode, babelConfig, target }) => {
  config.resolve.alias
    .set('babel-runtime-jsx-plus', require.resolve('babel-runtime-jsx-plus'))
    // @babel/runtime has no index
    .set('@babel/runtime', path.dirname(require.resolve('@babel/runtime/package.json')));

  config.target('web');
  config.context(rootDir);
  config.externals([
    function(ctx, request, callback) {
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
  [
    ['css'],
    ['scss', [['sass-loader', require.resolve('sass-loader')]]],
    ['less', [['less-loader', require.resolve('less-loader'), { javascriptEnabled: true }]]],
  ].forEach(([style, loaders]) => {
    configCSSRule(config, style, mode, loaders || [], target);
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

  const babelLoader = require.resolve('babel-loader');

  config.resolve.extensions.merge(['.js', '.json', '.jsx', '.ts', '.tsx', '.html']);

  // js loader
  config.module.rule('jsx')
    .test(/\.jsx?$/)
    .exclude
      .add(EXCLUDE_REGX)
      .end()
    .use('babel-loader')
      .loader(babelLoader)
      .options({ ...deepClone(babelConfig), cacheDirectory: true });

  // ts loader
  config.module.rule('tsx')
    .test(/\.tsx?$/)
    .exclude
      .add(EXCLUDE_REGX)
      .end()
    .use('babel-loader')
      .loader(babelLoader)
      .options({ ...deepClone(babelConfig), cacheDirectory: true })
      .end()
    .use('ts-loader')
      .loader(require.resolve('ts-loader'))
      .options({ transpileOnly: true });

  return config;
};
