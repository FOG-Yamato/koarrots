const Koa = require("koa");
const Router = require("koa-router");
const router = new Router();
const app = new Koa();

app.use(async (ctx, next) => {
  if (!ctx.session.admin) {
    ctx.redirect("/");
  }
  return next();
});

router.get("/", async (ctx, next) => {
  await ctx.render("admin/index", {
    articles: ctx.db.getArticles()
  });
  next();
});

router.get("/logs", async (ctx, next) => {
  ctx.body = ctx.db.logs.array();
  next();
});

router.get("/add", async (ctx, next) => {
  await ctx.render("admin/addpost");
  next();
});

router.post("/add", async (ctx, next) => {
  const id = ctx.db.articles.autonum;
  ctx.db.articles.set(id, {
    id, content: ctx.request.body.content,
    title: ctx.request.body.title,
    published: false,
    date: Date.now(),
    user: ctx.session.username
  });
  ctx.redirect(`/admin/edit/${id}`);
  next();
});

router.get("/adduser", async (ctx, next) => {
  await ctx.render("admin/adduser");
  next();
});

router.post("/adduser", async (ctx, next) => {
  ctx.db.newuser(ctx.request.body.username, ctx.request.body.name, ctx.request.body.password, ctx.request.body.admin === "on");
  ctx.redirect("/admin");
  next();
});

router.get("/users", async (ctx, next) => {
  ctx.body = ctx.db.getUsers();
  next();
});

router.get("/publish/:id", async (ctx, next) => {
  ctx.db.articles.set(ctx.params.id, true, "published");
  ctx.redirect("/admin");
  next();
});

router.get("/unpublish/:id", async (ctx, next) => {
  ctx.db.articles.set(ctx.params.id, false, "published");
  ctx.redirect("/admin");
  next();
});

router.get("/delete/:id", async (ctx, next) => {
  ctx.db.articles.delete(ctx.params.id);
  ctx.redirect("/admin");
  next();
});

router.get("/edit/:id", async (ctx, next) => {
  const article = ctx.db.articles.get(ctx.params.id);
  await ctx.render("admin/editpost", { article });
  next();
});

router.post("/edit", async (ctx, next) => {
  const article = ctx.db.articles.get(ctx.request.body.id);
  article.published = !!ctx.request.body.published;
  article.content = ctx.request.body.content;
  article.title = ctx.request.body.title;
  article.date = ctx.request.body.date;
  ctx.db.articles.set(ctx.request.body.id, article);
  // ctx.db.articles.set(ctx.params.id, "Edited Title", "title");
  ctx.redirect(`/admin/edit/${ctx.request.body.id}`);
  next();
});

router.get("/settings", async (ctx, next) => {
  await ctx.render("admin/settings");
  next();
});

router.post("/settings", async (ctx, next) => {
  ["title", "description", "author"].forEach(field => {
    ctx.db.settings.set(field, ctx.request.body[field]);
  });
  ctx.db.settings.set("init", true);
  ctx.db.settings.set("commentsEnabled", ctx.request.body.enableComments === "on");
  ctx.db.settings.set("registrationEnabled", ctx.request.body.enableRegistration === "on");
  ctx.redirect("/admin/settings");
  next();
});

module.exports = {
  app, router, conf: {
    route: "/admin",
    description: "Basic blog routes"
  }
};
