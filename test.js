// Native Imports
const { sep, resolve, join } = require("path");

// Koa Imports
const Koa = require('koa');
const Router = require('koa-router');
const render = require('koa-ejs');
const parser = require('koa-body');
const session = require('koa-session');
const mount = require("koa-mount");
const serve = require('koa-static');
const app = new Koa();
const router = new Router();

router.post("/test", async (ctx, next) => {
  console.log("Got post");
  ctx.body = "Ok";
  next();
});

app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods())

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

app.listen(3000);