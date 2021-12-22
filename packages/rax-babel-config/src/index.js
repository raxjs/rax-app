const chalk = require('chalk');
const resolvePlugin = require('./resolvePlugin');

let logOnce = true;

const defaultOptions = {
  jsxPlus: !process.env.DISABLE_JSX_PLUS,
  styleSheet: false,
  modules: false,
};

const typescriptPluginDefaultOptions = {
  jsxPragma: 'createElement',
  jsxPragmaFrag: 'Fragment',
  allowDeclareFields: true,
  allowNamespaces: true,
};

module.exports = (userOptions = {}) => {
  const options = Object.assign({}, defaultOptions, userOptions);
  const {
    styleSheet,
    jsxPlus = true,
    jsxToHtml,
    // preset-env modules options
    modules,
  } = options;

  const baseConfig = {
    presets: resolvePlugin([
      [
        '@builder/pack/deps/@babel/preset-env',
        {
          loose: true,
          modules,
          include: [
            'transform-computed-properties',
          ],
        },
      ],
      './classPreset',
      [
        '@builder/pack/deps/@babel/preset-typescript',
        typescriptPluginDefaultOptions,
      ],
      [
        '@builder/pack/deps/@babel/preset-react', {
          pragma: 'createElement',
          pragmaFrag: 'Fragment',
          throwIfNamespace: false,
        },
      ],
    ]),
    plugins: resolvePlugin([
      '@builder/pack/deps/@babel/plugin-syntax-dynamic-import',
      // Stage 0
      '@builder/pack/deps/@babel/plugin-proposal-function-bind',
      // Stage 1
      '@builder/pack/deps/@babel/plugin-proposal-export-default-from',
      [
        '@builder/pack/deps/@babel/plugin-proposal-optional-chaining',
        { loose: true },
      ],
      [
        '@builder/pack/deps/@babel/plugin-proposal-nullish-coalescing-operator',
        { loose: true },
      ],
      // Stage 2
      '@builder/pack/deps/@babel/plugin-proposal-export-namespace-from',
      'babel-plugin-minify-dead-code-elimination-while-loop-fixed',
    ]),
  };

  if (jsxToHtml) {
    // Must transform before other jsx transformer
    baseConfig.plugins.push(require.resolve('babel-plugin-transform-jsx-to-html'));
  }

  // Enable jsx plus default.
  if (jsxPlus) {
    baseConfig.plugins = baseConfig.plugins.concat(resolvePlugin([
      'babel-plugin-transform-jsx-list',
      'babel-plugin-transform-jsx-condition',
      'babel-plugin-transform-jsx-memo',
      'babel-plugin-transform-jsx-slot',
      ['babel-plugin-transform-jsx-fragment', { moduleName: 'rax' }],
      'babel-plugin-transform-jsx-class',
    ]));

    if (logOnce) {
      console.log(chalk.green('JSX+ enabled, documentation: https://rax.js.org/docs/guide/component'));
      logOnce = false;
    }
  }

  if (styleSheet) {
    baseConfig.plugins.push([
      require.resolve('babel-plugin-transform-jsx-stylesheet'),
      {
        retainClassName: true,
        // enable `forceEnableCSS`
        // skip jsx attribute convert when use css module
        forceEnableCSS: styleSheet.forceEnableCSS,
      },
    ]);
  }

  return baseConfig;
};
