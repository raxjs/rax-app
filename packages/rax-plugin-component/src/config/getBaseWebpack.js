const webpack = require("webpack");
const Chain = require("webpack-chain");
const { getBabelConfig, setBabelAlias } = require("rax-compile-config");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const babelConfig = getBabelConfig({
  styleSheet: true,
  custom: {
    ignore: ["**/**/*.d.ts"]
  }
});

module.exports = context => {
  const { rootDir, command } = context;

  const config = new Chain();

  setBabelAlias(config);

  config.target("web");
  config.context(rootDir);

  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf("@weex-module") !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      if (request.indexOf("@system") !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    }
  ]);

  config.resolve.extensions.merge([
    ".js",
    ".json",
    ".jsx",
    ".ts",
    ".tsx",
    ".html"
  ]);

  config.module
    .rule("jsx")
    .test(/\.(js|mjs|jsx)$/)
    .use("babel")
    .loader(require.resolve("babel-loader"))
    .options(babelConfig);

  config.module
    .rule("tsx")
    .test(/\.tsx?$/)
    .use("babel")
    .loader(require.resolve("babel-loader"))
    .options(babelConfig)
    .end()
    .use("ts")
    .loader(require.resolve("ts-loader"));

  config.module
    .rule("assets")
    .test(/\.(svg|png|webp|jpe?g|gif)$/i)
    .use("source")
    .loader(require.resolve("image-source-loader"));

  config.plugin("caseSensitivePaths").use(CaseSensitivePathsPlugin);

  config.plugin("noError").use(webpack.NoEmitOnErrorsPlugin);

  if (command === "dev") {
    config.mode("development");
    config.devtool("inline-module-source-map");
  } else if (command === "build") {
    config.mode("production");

    config.optimization
      .minimizer("terser")
      .use(TerserPlugin, [
        {
          terserOptions: {
            output: {
              comments: false
            }
          },
          extractComments: false
        }
      ])
      .end()
      .minimizer("optimizeCSS")
      .use(OptimizeCSSAssetsPlugin);
  }

  return config;
};
