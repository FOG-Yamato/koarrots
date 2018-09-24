// Native Imports
const { join } = require("path");
const { readdirSync, statSync } = require("fs");

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

// Load config file
const config = require("./config.json");
app.context.config = config;

app.keys = [config.secret];
app.use(session({ store: require("./enmap-session.js") }, app));

app.use(mount("/public", serve("./static")));

render(app, {
  root: join(__dirname, "views"),
  layout: "template",
  viewExt: "html",
  cache: false,
  debug: false
});

const middleware = ["part1", "foyer", "logging", "errorhandling", "settings", "state", "part2"];
for (const name of middleware) {
  app.use(require(`./middleware/${name}.js`));
}

readdirSync("./routes")
  .forEach(file => {
    const data = require(`./routes/${file}`);
    app.use(mount(data.conf.route, data.app
      .use(parser())
      .use(data.router.routes())
      .use(data.router.allowedMethods())));
  });

app
  .use(parser())
  .use(router.routes())
  .use(router.allowedMethods());

app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

app.listen(config.port);
