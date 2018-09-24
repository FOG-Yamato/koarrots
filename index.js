// Native Imports
const { join } = require("path");

// Koa Imports
const Koa = require("koa");
const Router = require("koa-router");
const render = require("koa-ejs");
const parser = require("koa-bodyparser");
const session = require("koa-session");
const mount = require("koa-mount");
const serve = require("koa-static");
const app = new Koa();
const router = new Router();

// Third-Party Imports
// Enmap DB Wrapper
app.context.db = require("./enmap-db.js");

app.keys = ["some secret hurr"];
app.use(session(app));

app.use(mount("/public", serve("./static")));

render(app, {
  root: join(__dirname, "views"),
  layout: "template",
  viewExt: "html",
  cache: false,
  debug: false
});

app.use(require("./middleware/foyer.js"));
app.use(require("./middleware/logging.js"));
app.use(require("./middleware/errorhandling.js"));
app.use(require("./middleware/settings.js"));
app.use(require("./middleware/state.js"));
app.use(require("./middleware/part1.js"));
app.use(require("./middleware/part2.js"));

app.use(mount(require("./routes/blog.js")));
app.use(mount(require("./routes/account.js")));
app.use(mount("/api", require("./routes/api.js")));
app.use(mount("/json", require("./routes/json.js")));
app.use(mount("/admin", require("./routes/admin.js")));

app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods());

app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

app.listen(3000);
