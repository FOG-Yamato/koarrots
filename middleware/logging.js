module.exports = async (ctx, next) => {
  // ignore f*cking favicon as the very first action. ugh.
  if (ctx.path === "/favicon.ico") return null;

  // Set "previous" URL to session (for after logging)
  const notsaved = ["/login", "/register", "/adduser", "/favicon.ico"];
  if (!notsaved.some(path => ctx.url.includes(path))) {
    ctx.session.back = ctx.url;
  }
  return next();
};
