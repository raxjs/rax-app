const path = require('path');
const fse = require('fs-extra');
const { useExpressDevPack } = require('@midwayjs/faas-dev-pack');

module.exports = async ({ context, onGetWebpackConfig }) => {
  const { rootDir, command } = context;

  const hasAPI = fse.existsSync(path.join(rootDir, 'src/apis'));

  const target = process.env.RAX_SSR ? 'ssr' : 'web';

  // Register FaaS Dev Server for API
  onGetWebpackConfig(target, (config) => {
    if (command === 'start' && hasAPI) {
      const originalDevServerBefore = config.devServer.get('before');

      config.merge({
        devServer: {
          before(app, server) {
            // If originalDevServerBefore is before than midway, ssr will shut down
            if (typeof originalDevServeBefore === 'function') {
              originalDevServerBefore(app, server);
            }
            app.use(
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useExpressDevPack({
                functionDir: rootDir,
                sourceDir: 'src/apis',
                // ignore static file
                ignorePattern: (req) => {
                  return /\.(js|css|map|json|png|jpg|jpeg|gif|svg|eot|woff2|ttf)$/.test(req.path);
                },
              }),
            );
          },
        },
      });
    }
  });
};
