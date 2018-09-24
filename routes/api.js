const Koa = require("koa");
const Router = require("koa-router");
const router = new Router();
const app = new Koa();

router.get("/genkey", async (ctx) => {
  if (!ctx.session.logged) {
    ctx.redirect("/login");
    return;
  }
  ctx.db.generateToken(ctx.session.username);
  ctx.redirect("/me");
});

router.use(async (ctx, next) => {
  if (!ctx.headers.authorization) {
    ctx.throw(400, "Missing authorization:token header.");
    return;
  }
  const user = ctx.db.users.find("apiToken", ctx.headers.authorization);
  if (!user) {
    console.log(`Attempted API access with ${ctx.headers.authorization} refused because the token was invalid.`);
    ctx.throw(403, "Invalid Token");
    return;
  }
  ctx.user = user;
  next();
});

router.post("/newarticle", async (ctx, next) => {
  const article = ctx.request.body;
  if (!article.title || !article.content) {
    return ctx.throw(400, "Invalid Form Body: Missing title or content");
  }
  const data = Object.assign({ user: ctx.user.username }, article);
  const id = db.addArticle(data.title, data.content, data.user, data.published == null ? false : data.published);
  ctx.body = {
    id,
    url: `/view/${id}`
  };
});

module.exports = {
  app, router, conf: {
    route: "/api",
    description: "REST API Routes"
  }
};
