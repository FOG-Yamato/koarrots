const Koa = require('koa');
const Router = require('koa-router');
const parser = require('koa-body');
const router = new Router();

const app = new Koa();

router.get("/", async (ctx, next) => {
  await ctx.render('posts', {
    articles: ctx.db.getArticles(true)
  });
  next();
});

router.get("/view/:id", async (ctx, next) => {
  await ctx.render('post', {
    article: ctx.db.getArticle(ctx.params.id)
  });
  next();
});

router.get("/random", async (ctx, next) => {
  const rand = ctx.db.articles.randomKey();
  await ctx.render('post', {
    article: ctx.db.getArticle(rand)
  });
  next();
})

app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods())

module.exports = app;