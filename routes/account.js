const Koa = require("koa");
const Router = require("koa-router");
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
  if (!ctx.request.body.username || !ctx.request.body.password) {
    ctx.throw(400, "Missing Username or Password");
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
    ctx.throw(403, "Nope. Not allowed, mate.");
  }
});

router.get("/logout", async (ctx) => {
  ctx.session = null;
  ctx.redirect("/");
});

router.get("/install", async (ctx) => {
  const { db } = ctx.state;
  if (db.settings.count > 0 || db.users.count > 0) {
    ctx.status = 403;
    ctx.message = "ALREADY INITIALIZED, GO AWAY PUNY HUMAN!";
    return;
  }
  await ctx.render("install");
});

router.post("/install", async (ctx) => {
  console.log("Getting Install Data");
  const { db } = ctx.state;
  if (db.settings.count > 0 || db.users.count > 0) {
    ctx.throw(403, "ALREADY INITIALIZED, GO AWAY PUNY HUMAN!");
    return;
  }
  const checks = ["username", "password", "title", "description", "author"];
  if (checks.some(field => ctx.request.body[field].length < 3)) {
    ctx.throw(400, "Field information missing to create the site.");
    return;
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
});

module.exports = {
  app, router, conf: {
    route: "/",
    description: "Account Routes"
  }
};
