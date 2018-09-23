const Koa = require('koa');
const Router = require('koa-router');
const parser = require('koa-body');
const router = new Router();

const app = new Koa();

router.get("/install", async (ctx, next) => {
  const db = ctx.state.db;
  if (db.settings.count > 0 || db.users.count > 0) {
    ctx.status = 403;
    ctx.message = "ALREADY INITIALIZED, GO AWAY PUNY HUMAN!";
    return next();
  }
  await ctx.render('install');
  next();
});

router.post("/install", async (ctx, next) => {
  console.log("Getting Install Data");
  console.dir(ctx.request.body);
  const db = ctx.state.db;
  ctx.body = "Ok";
  next();
    /*
  if (db.settings.count > 0 || db.users.count > 0) {
    ctx.status = 403;
    ctx.message = "ALREADY INITIALIZED, GO AWAY PUNY HUMAN!";
    return next();
  }
  const checks = ["username", "password", "title", "description", "author"];
  if (checks.some(field => ctx.request.body[field].length < 3)) {
    ctx.status = 400;
    ctx.message = "Field information missing to create the site.";
    return next();
  }

  checks.slice(2).forEach(field => {
    db.settings.set(field, ctx.request.body[field]);
  });
  db.settings.set("init", true);
  db.settings.set("commentsEnabled", ctx.request.body.enableComments === "on");
  db.settings.set("registrationEnabled", ctx.request.body.enableRegistration === "on");

  db.newuser(ctx.request.body.username, ctx.request.body.name, ctx.request.body.password, true);

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
    const cmt = db.comments.autonum;
    db.comments.set(cmt, {
      id: cmt,
      parent: one,
      content: "FUN FACT! : 'Lorem ipsum dolor sit amet' translates to 'Lorem ipsum carrots' on Google Translate!",
      user: ctx.request.body.username,
      date: Date.now()
    });
  }
  return ctx.redirect("/");*/
})

app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods())

module.exports = app;