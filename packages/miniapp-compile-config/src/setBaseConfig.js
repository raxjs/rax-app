const webpack = require('webpack');
const ComponentLoader = require.resolve("jsx2mp-loader/src/component-loader");
const ScriptLoader = require.resolve("jsx2mp-loader/src/script-loader");
const FileLoader = require.resolve("jsx2mp-loader/src/file-loader");
const {
  platformMap,
  pathHelper: { getPlatformExtensions },
} = require("miniapp-builder-shared");

const ModifyOutputFileSystemPlugin = require("./plugins/ModifyOutputFileSystem");
const CopyJsx2mpRuntimePlugin = require("./plugins/CopyJsx2mpRuntime");
const CopyPublicFilePlugin = require("./plugins/CopyPublicFile");

module.exports = (
  config,
  userConfig,
  {
    context,
    onGetWebpackConfig,
    entryPath,
    outputPath,
    loaderParams,
    target,
  }
) => {
  const platformInfo = platformMap[target];
  const { rootDir } = context;
  const {
    platform = platformInfo.type,
    mode = "build",
    disableCopyNpm = false,
  } = userConfig;

  // Set alias
  config.resolve.alias.clear();
  config.resolve.alias
    .set('react', 'rax')
    .set('react-dom', 'rax-dom');
  onGetWebpackConfig(target, (config) => {
    const aliasEntries = config.resolve.alias.entries();
    loaderParams.aliasEntries = aliasEntries;
  });

  // Clear prev rules
  config.module.rule("jsx").uses.clear();
  config.module.rule("tsx").uses.clear();

  config.module
    .rule("tsx")
    .test(/\.(tsx?)$/)
    .use("ts")
    .loader(require.resolve("ts-loader"))
    .options({
      transpileOnly: true,
    });

  // Remove all app.json before it
  config.module.rule("appJSON").uses.clear();

  config.module
    .rule("withRoleJSX")
    .test(/\.t|jsx?$/)
    .enforce("post")
    .exclude.add(/node_modules/)
    .end()
    .use("component")
    .loader(ComponentLoader)
    .options({
      ...loaderParams,
      entryPath
    })
    .end()
    .use("platform")
    .loader(require.resolve("rax-compile-config/src/platformLoader"))
    .options({ platform: target })
    .end()
    .use("script")
    .loader(ScriptLoader)
    .options(loaderParams)
    .end();

  config.module
    .rule("npm")
    .test(/\.js$/)
    .include.add(/node_modules/)
    .end()
    .use("script")
    .loader(ScriptLoader)
    .options(loaderParams)
    .end();

  config.module
    .rule("staticFile")
    .test(/\.(bmp|webp|svg|png|webp|jpe?g|gif)$/i)
    .use("file")
    .loader(FileLoader)
    .options({
      entryPath,
      outputPath,
    });

  // Exclude app.json
  config.module
    .rule("json")
    .test(/\.json$/)
    .use("script-loader")
    .loader(ScriptLoader)
    .options(loaderParams)
    .end()
    .use("json-loader")
    .loader(require.resolve("json-loader"));

  // Distinguish end construction
  config.resolve.extensions
    .clear()
    .merge(
      getPlatformExtensions(platform, [".js", ".jsx", ".ts", ".tsx", ".json"])
    );

  config.resolve.mainFields.add("main").add("module");

  config.externals([
    function (ctx, request, callback) {
      if (/\.(css|sass|scss|styl|less)$/.test(request)) {
        return callback(null, `commonjs2 ${request}`);
      }
      callback();
    },
  ]);

  config.plugin("define").use(webpack.DefinePlugin, [
    {
      "process.env": {
        NODE_ENV: mode === "build" ? '"production"' : '"development"',
      },
    },
  ]);

  config
    .plugin("watchIgnore")
    .use(webpack.WatchIgnorePlugin, [[/node_modules/]]);

  config.plugin("modifyOutputFileSystem").use(ModifyOutputFileSystemPlugin);

  if (loaderParams.constantDir.length > 0) {
    config
      .plugin("copyPublicFile")
      .use(CopyPublicFilePlugin, [
        { mode, outputPath, rootDir, constantDirectories, target },
      ]);
  }

  if (!disableCopyNpm) {
    config
      .plugin("runtime")
      .use(CopyJsx2mpRuntimePlugin, [{ platform, mode, outputPath, rootDir }]);
  }
};
