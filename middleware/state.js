const db = require("../enmap-db.js");
module.exports = async (ctx, next) => {
  ctx.state = ctx.state || {};
  ctx.state.now = new Date();
  ctx.state.ip = ctx.ip;
  ctx.state.db = db;
  return next();
};
