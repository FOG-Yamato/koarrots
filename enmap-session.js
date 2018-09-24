const Enmap = require("enmap");
const sessions = new Enmap({ name: "sessions", copyLevel: "deep" });

module.exports = {
  get: async (key, maxAge, { rolling }) => {
    await sessions.defer;
    if (!sessions.has(key)) return null;
    const data = sessions.get(key);
    delete data._maxAge;
    delete data._expire;
    return data;
  },
  set: async (key, sess, maxAge, { rolling, changed }) => {
    await sessions.defer;
    sess._maxAge = maxAge;
    sess._expire = Date.now() + maxAge;
    return sessions.set(key, sess);
  },
  destroy: async (key) => {
    await sessions.defer;
    sessions.delete(key);
  }
};
