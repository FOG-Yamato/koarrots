const Koa = require('koa');
const Router = require('koa-router');
const parser = require('koa-body');
const router = new Router();

const app = new Koa();

router.get("/", async (ctx, next) => {
  const users = [{ name: 'Dead Horse' }, { name: 'Jack' }, { name: 'Tom' }];
  ctx.state.settings = {
    title: "Blog Title",
    description: "A blog full of pure awesomeness",
    author: "Your Name Here",
    init: false
  };
  ctx.state.auth = {};
  ctx.state.path = "/"
  await ctx.render('content', {
    users
  });
});

app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods())

module.exports = app;