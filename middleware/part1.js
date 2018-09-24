module.exports = async (ctx, next) => {
  await next();
  const rt = ctx.response.get("X-Response-Time");
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
  ctx.db.logs.set(ctx.db.logs.autonum, {
    time: ctx.db.formatDate(Date.now()),
    agent: ctx.request.get("user-agent"),
    ip: ctx.ip,
    page: ctx.url,
    execution: rt,
    method: ctx.method
  });
};
