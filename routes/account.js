const Koa = require("koa");
const Router = require("koa-router");
const parser = require("koa-bodyparser");
const router = new Router();

const app = new Koa();

router.get(["/user/:id", "/user"], async (ctx, next) => {
  const user = ctx.db.users.get(ctx.params.id || ctx.session.username);
  if (!user) return ctx.redirect("/login");
  const comments = ctx.db.comments.filter(comment => comment.user === user.username);
  const articles = ctx.db.articles.filter(article => article.user === user.username);
  await ctx.render("user", {
    user,
    articles,
    comments
  });
  next();
});

router.get("/me", async (ctx, next) => {
  if (!ctx.session.logged) return ctx.redirect("/login");
  const user = ctx.db.users.get(ctx.session.username);
  const comments = ctx.db.comments.filter(comment => comment.user === user.username);
  const articles = ctx.db.articles.filter(article => article.user === user.username);
  await ctx.render("me", {
    user,
    articles,
    comments
  });
  next();
});

router.get("/register", async (ctx, next) => {
  await ctx.render("register");
  next();
});

router.post("/register", async (ctx, next) => {
  ctx.db.newuser(ctx.request.body.username, ctx.request.body.name, ctx.request.body.password, ctx.request.body.admin === "on");
  ctx.redirect(ctx.session.back || "/");
  next();
});

router.get("/login", async (ctx, next) => {
  await ctx.render("login");
  next();
});

router.post("/login", async (ctx, next) => {
  console.log(ctx.request.body);
  if (!ctx.request.body.username || !ctx.request.body.password) {
    // res.status(400).send("Missing Username or Password");
  }
  const success = await ctx.db.login(ctx.request.body.username, ctx.request.body.password);
  if (success) {
    const user = ctx.db.users.get(ctx.request.body.username);
    ctx.session.logged = true;
    ctx.session.username = ctx.request.body.username;
    ctx.session.admin = user.admin;
    ctx.session.avatar = user.avatar;
    ctx.session.name = user.name;
    ctx.session.save();
    console.log(`User authenticated: ${user.username}`);
    ctx.redirect(ctx.session.back || "/");
  } else {
    console.log("Authentication Failed");
    ctx.redirect("/");
    // res.status(403).send("Nope. Not allowed, mate.");
  }
  next();
});

router.get("/logout", async (ctx, next) => {
  ctx.session = null;
  ctx.redirect("/");
  next();
});

router.get("/install", async (ctx, next) => {
  const { db } = ctx.state;
  if (db.settings.count > 0 || db.users.count > 0) {
    ctx.status = 403;
    ctx.message = "ALREADY INITIALIZED, GO AWAY PUNY HUMAN!";
    return next();
  }
  await ctx.render("install");
  next();
});

router.post("/install", async (ctx, next) => {
  console.log("Getting Install Data");
  const { db } = ctx.state;
  if (db.settings.count > 0 || db.users.count > 0) {
    console.log("403");
    ctx.status = 403;
    ctx.message = "ALREADY INITIALIZED, GO AWAY PUNY HUMAN!";
    return next();
  }
  const checks = ["username", "password", "title", "description", "author"];
  if (checks.some(field => ctx.request.body[field].length < 3)) {
    console.log("400");
    ctx.status = 400;
    ctx.message = "Field information missing to create the site.";
    return next();
  }
  console.log("Got passed the checks");
  checks.slice(2).forEach(field => {
    db.settings.set(field, ctx.request.body[field]);
  });
  db.settings.set("init", true);
  db.settings.set("commentsEnabled", ctx.request.body.enableComments === "on");
  db.settings.set("registrationEnabled", ctx.request.body.enableRegistration === "on");
  console.log("Got passed writing initial settings");

  db.newuser(ctx.request.body.username, ctx.request.body.name, ctx.request.body.password, true);
  console.log("Got passed writing user");

  if (ctx.request.body.examples) {
    const one = db.articles.autonum;
    db.articles.set(one, {
      id: one,
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam imperdiet iaculis nulla quis malesuada. Phasellus feugiat sed ipsum vel fermentum. Nullam efficitur volutpat lectus. Vestibulum elementum porta sem nec luctus. Integer mauris felis, placerat a volutpat ut, sollicitudin quis est. Nulla a elit placerat dolor pulvinar euismod sit amet laoreet mauris. Fusce ac odio vitae diam ultricies accumsan pulvinar ornare ex. Nunc enim dui, pellentesque vel nibh ut, lacinia eleifend magna. Aenean ac orci est. Donec aliquam urna tellus, et mollis velit fermentum vitae. Aliquam porttitor nisl ut lacus fringilla dictum. Pellentesque blandit metus risus, vitae commodo magna sollicitudin at.",
      title: "This is a test post because who wants an empty page?",
      published: true,
      date: Date.now(),
      user: ctx.request.body.username
    });
    console.log("Got passed writing first article");
    const cmt = db.comments.autonum;
    db.comments.set(cmt, {
      id: cmt,
      parent: one,
      content: "FUN FACT! : 'Lorem ipsum dolor sit amet' translates to 'Lorem ipsum carrots' on Google Translate!",
      user: ctx.request.body.username,
      date: Date.now()
    });
  }
  console.log("All done!");
  ctx.redirect("/");
  next();
});

app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods());

module.exports = app;
