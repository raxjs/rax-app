const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const getBaseWebpack = require("./getBaseWebpack");

module.exports = context => {
  const config = getBaseWebpack(context);

  config.output.filename("[name].js");

  config.module
    .rule("css")
    .test(/\.css?$/)
    .use("style")
    .loader(require.resolve("style-loader"))
    .end()
    .use("css")
    .loader(require.resolve("css-loader"))
    .end()
    .use("postcss")
    .loader(require.resolve("postcss-loader"))
    .options({
      ident: "postcss",
      plugins: () => [
        require("postcss-preset-env")({
          autoprefixer: {
            flexbox: "no-2009",
          },
          stage: 3,
        }),
        require("postcss-plugin-rpx2vw")(),
      ],
    });

  config.module
    .rule("less")
    .test(/\.less?$/)
    .use("style")
    .loader(require.resolve("style-loader"))
    .end()
    .use("css")
    .loader(require.resolve("css-loader"))
    .end()
    .use("postcss")
    .loader(require.resolve("postcss-loader"))
    .options({
      ident: "postcss",
      plugins: () => [
        require("postcss-preset-env")({
          autoprefixer: {
            flexbox: "no-2009",
          },
          stage: 3,
        }),
        require("postcss-plugin-rpx2vw")(),
      ],
    })
    .end()
    .use("less")
    .loader(require.resolve("less-loader"));

  config.plugin("html").use(HtmlWebpackPlugin, [
    {
      inject: true,
      filename: "portal",
      chunks: ["portal"],
      template: path.resolve(__dirname, "./portal.html"),
    },
  ]);

  return config;
};
