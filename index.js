// Native Imports
const { sep, resolve, join } = require("path");

// Koa Imports
const Koa = require('koa');
const Router = require('koa-router');
const render = require('koa-ejs');
const parser = require('koa-body');
const session = require('koa-session');
const mount = require("koa-mount");
const serve = require('koa-static');
const app = new Koa();
const router = new Router();

const dataDir = resolve(`${process.cwd()}${sep}`);

// Third-Party Imports
// Enmap DB Wrapper
app.context.db = require("./enmap-db.js");

app.keys = ['some secret hurr'];
app.use(session(app));

app.use(mount("/public", serve("./static")));

render(app, {
  root: join(__dirname, 'views'),
  layout: 'template',
  viewExt: 'html',
  cache: false,
  debug: false
});

app.use(async (ctx, next) => {
  // ignore f*cking favicon as the very first action. ugh.
  if (ctx.path === '/favicon.ico') return;

  // Set "previous" URL to session (for after logging)
  const notsaved = ["/includes", "/register", "/adduser", "/favicon.ico"];
  if (!notsaved.some(path => ctx.url.includes(path))) {
    ctx.session.back = ctx.url;
  }
  return next();
})

app.use(function (ctx, next) {
  ctx.state = ctx.state || {};
  ctx.state.now = new Date();
  ctx.state.ip = ctx.ip;
  ctx.state.db = app.context.db;
  return next();
});

// Attach Settings to state
app.use(async (ctx, next) => {
  await app.context.db.settings.defer;
  let settings = {};
  if (app.context.db.settings.has("title")) {
    for (const [key, value] of app.context.db.settings) {
      settings[key] = value;
    }
  } else {
    settings = {
      title: "Blog Title",
      description: "A blog full of pure awesomeness",
      author: "Your Name Here",
      init: false
    };
    console.log(ctx.url, ctx.method); 
    if (!ctx.url.includes("/install")) {
      ctx.state.settings = settings;
      return ctx.redirect("/install");
    }
  }
  ctx.state.settings = settings;
  ctx.state.path = ctx.url;
  ctx.state.auth = {};
  return next();
});

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
  const db = app.context.db;
  db.logs.set(db.logs.autonum, {
    time: db.formatDate(Date.now()),
    agent: ctx.request.get("user-agent"),
    ip: ctx.ip,
    page: ctx.url,
    execution: rt,
    method: ctx.method
  });
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

//app.use(mount(require("./routes/blog.js")));
app.use(mount(require("./routes/account.js")));
app.use(mount("/admin", require("./routes/admin.js")));

app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods())

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

app.listen(3000);