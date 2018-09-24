const statuscodes = {
  420: "Calm your tits and gtfo",
  406: "This is... Unacceptable. http://favoritememes.com/_nw/88/39598762.jpg",
  418: "I'm a little teapot short and stout. Here is my banhammer here is my BLOCK."
};

const banned = [
  "/login.cgi",
  "/wp_admin",
  "/testget",
  "/phpMyAdmin",
  "/manager"
];

const bannedSet = new Set();

module.exports = async (ctx, next) => {
  // Welcome to the foyer, gentlmen! Settle down while we check your credentials.
  if (bannedSet.has(ctx.ip)) {
    // I'm sorry sir I'll have to ask you to leave now, you're not welcome here. SECURITY!
    ctx.status = 301;
    ctx.redirect("http://www.silverraven.com/fy.htm");
    return next();
  }
  if (banned.some(url => ctx.url.includes(url))) {
    // Sir I'm going to have to ask you nicely to leave this place. Here's a random card for your troubles.
    const codes = Object.entries(statuscodes);
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    bannedSet.add(ctx.ip);
    ctx.throw(400, randomCode[1]);
    return next();
  }
  return next();
};
