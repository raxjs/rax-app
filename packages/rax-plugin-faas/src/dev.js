const path = require('path');
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

module.exports = ({ context }, options) => {
  const { rootDir } = context;
  const { functions } = options;

  functions.forEach((fnc) => {
    const [ fileName, fncName ] = fnc.handler.split('.');
    const handlerPath = path.resolve(rootDir, fnc.path, fileName);
    const handler = require(handlerPath)[fncName];
    const routePath = fnc.name;

    router.get(`/${routePath}*`,async (ctx) => {
      const { request, response } = ctx;

      // aliyun fc request
      const customReq = {
        headers: request.headers,
        path: request.path,
        queries: request.query,
        method: request.method,
        clientIP: request.ip,
        url: request.url,
      }

      // aliyun fc response
      const customRes = {
        setStatusCode: (value) => {
          response.status = value;
        },
        setHeader: response.set,
        deleteHeader: response.remove,
        send: (value) => {
          response.body = value;
        },
      }

      await handler(customReq, customRes, {});
    });
  })

  app
    .use(router.routes())
    .use(router.allowedMethods());

  app.listen(3000);
  console.log('Faas development server at 127.0.0.1:3000');
};
