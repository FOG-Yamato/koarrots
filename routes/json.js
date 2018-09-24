const Koa = require("koa");
const Router = require("koa-router");
const router = new Router();

const app = new Koa();

router.get("/articles", async (ctx, next) => {
  ctx.body = ctx.db.getArticles();
  next();
});

router.get("/article/:id", async (ctx, next) => {
  ctx.body = ctx.db.getArticle(ctx.params.id);
  next();
});

router.get("/comments/:postid", async (ctx, next) => {
  ctx.body = ctx.db.getComments(ctx.params.postid);
  next();
});

router.get("/users", async (ctx, next) => {
  ctx.body = ctx.db.getUsers(true);
  next();
});

router.get("/user/:id", async (ctx, next) => {
  ctx.body = ctx.db.getUser(true);
  next();
});

app
  .use(router.routes())
  .use(router.allowedMethods());

module.exports = app;
