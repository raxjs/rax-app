const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const getBaseWebpack = require("./getBaseWebpack");

module.exports = context => {
  const config = getBaseWebpack(context);

  config.target("web");

  config.output.libraryTarget("umd").filename("[name].js");

  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf("@weex-module") !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ]);

  config.module
    .rule("css")
    .test(/\.css?$/)
    .use("css")
    .loader(require.resolve("stylesheet-loader"));

  config.module
    .rule("less")
    .test(/\.less?$/)
    .use("css")
    .loader(require.resolve("stylesheet-loader"))
    .end()
    .use("less")
    .loader(require.resolve("less-loader"));

  config.plugin("minicss").use(MiniCssExtractPlugin, [
    {
      filename: "[name].css",
    },
  ]);

  config.plugin("html").use(HtmlWebpackPlugin, [
    {
      inject: true,
      filename: "portal.html",
      chunks: ["portal"],
      template: path.resolve(__dirname, "./portal.html"),
    },
  ]);

  return config;
};
