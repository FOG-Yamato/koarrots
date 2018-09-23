const Koa = require('koa');
const Router = require('koa-router');
const parser = require('koa-body');
const router = new Router();

const app = new Koa();

router.get("/", async (ctx, next) => {
  ctx.body = "test";
  console.log(ctx.state);
  next();
});

router.get("/test", async (ctx, next) => {
  ctx.body = "test";
  next();
})

app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods())

module.exports = app;