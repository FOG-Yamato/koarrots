module.exports = async (ctx, next) => {
  await ctx.db.settings.defer;
  let settings = {};
  if (ctx.db.settings.has("title")) {
    for (const [key, value] of ctx.db.settings) {
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
  ctx.state.auth = ctx.session;
  return next();
};
