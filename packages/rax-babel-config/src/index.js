const chalk = require('chalk');
const babelMerge = require('babel-merge');

const defaultOptions = {
  jsxPlus: !process.env.DISABLE_JSX_PLUS,
  styleSheet: false,
  modules: false,
};

let logOnce = true;

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
    presets: [
      require.resolve('@babel/preset-flow'),
      [
        require.resolve('@babel/preset-env'),
        {
          loose: true,
          modules,
          include: [
            'transform-computed-properties',
          ],
        },
      ],
      [
        require.resolve('@babel/preset-react'), {
          pragma: 'createElement',
          pragmaFrag: 'Fragment',
          throwIfNamespace: false,
        },
      ],
    ],
    plugins: [
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      // Stage 0
      require.resolve('@babel/plugin-proposal-function-bind'),
      // Stage 1
      require.resolve('@babel/plugin-proposal-export-default-from'),
      [
        require.resolve('@babel/plugin-proposal-optional-chaining'),
        { loose: true },
      ],
      [
        require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
        { loose: true },
      ],
      // Stage 2
      [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
      require.resolve('@babel/plugin-proposal-export-namespace-from'),
      // Stage 3
      [
        require.resolve('@babel/plugin-proposal-class-properties'),
        { loose: true },
      ],
      require.resolve('babel-plugin-minify-dead-code-elimination-while-loop-fixed'),
    ],
  };

  const configArr = [baseConfig];

  if (jsxToHtml) {
    // Must transform before other jsx transformer
    configArr.push({
      plugins: [
        require.resolve('babel-plugin-transform-jsx-to-html'),
      ],
    });
  }

  // Enable jsx plus default.
  if (jsxPlus) {
    configArr.push({
      plugins: [
        require.resolve('babel-plugin-transform-jsx-list'),
        require.resolve('babel-plugin-transform-jsx-condition'),
        require.resolve('babel-plugin-transform-jsx-memo'),
        require.resolve('babel-plugin-transform-jsx-slot'),
        [require.resolve('babel-plugin-transform-jsx-fragment'), { moduleName: 'rax' }],
        require.resolve('babel-plugin-transform-jsx-class'),
      ],
    });

    if (logOnce) {
      console.log(chalk.green('JSX+ enabled, documentation: https://rax.js.org/docs/guide/component'));
      logOnce = false;
    }
  }

  if (styleSheet) {
    configArr.push({
      plugins: [
        [
          require.resolve('babel-plugin-transform-jsx-stylesheet'),
          {
            retainClassName: true,
            // enable `forceEnableCSS`
            // skip jsx attribute convert when use css module
            forceEnableCSS: styleSheet.forceEnableCSS,
          },
        ],
      ],
    });
  }

  const result = babelMerge.all(configArr);

  return result;
};
