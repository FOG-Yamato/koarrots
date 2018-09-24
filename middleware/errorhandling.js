module.exports = async (ctx, next) => {
  try {
    await next();
    const status = ctx.status || 404;
    if (status === 404) {
      ctx.throw(404);
    }
  } catch (err) {
    ctx.status = err.status || 500;
    if (ctx.status === 404) {
      await ctx.render("404");
    } else {
      await ctx.render("500", { err });
    }
  }
};
