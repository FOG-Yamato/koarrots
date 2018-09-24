const Koa = require("koa");
const Router = require("koa-router");
const parser = require("koa-bodyparser");
const router = new Router();

const app = new Koa();

router.get("/genkey", async (ctx, next) => {
  if (!ctx.session.logged) return ctx.redirect("/login");
  ctx.db.generateToken(ctx.session.username);
  ctx.redirect("/me");
  return next();
});

router.use(async (ctx, next) => {
  if (!ctx.headers.authorization) {
    ctx.status = 400;
    ctx.message = "Missing authorization:token header.";
    return;
  }
  const user = ctx.db.users.find("apiToken", ctx.headers.authorization);
  if (!user) {
    console.log(`Attempted API access with ${ctx.headers.authorization} refused because the token was invalid.`);
    ctx.status = 403;
    ctx.message = "Invalid Token";
    return;
  }
  ctx.user = user;
  next();
});
/*
router.post("/newarticle", async (ctx, next) => {
  const article = req.body;
  // (title, content, user, published = false)
  if (!article.title || !article.content) {
    return res.status(400).send("Invalid Form Body: Missing title or content");
  }
  const data = Object.assign({ user: req.user.username }, article);
  const id = db.addArticle(data.title, data.content, data.user, data.published == null ? false : data.published);
  return res.json({
    id,
    url: `/view/${id}`
  });
});
*/
app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods());

module.exports = app;
