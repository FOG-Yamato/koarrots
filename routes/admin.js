const Koa = require('koa');
const Router = require('koa-router');
const parser = require('koa-body');
const router = new Router();

const app = new Koa();

router.get("/", async (ctx, next) => {
  await ctx.render('admin/index', {
    articles: ctx.db.getArticles()
  });
});

app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods())

module.exports = app;