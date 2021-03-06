const Enmap = require("enmap");
const bcrypt = require("bcrypt");
const marked = require("marked");
const hat = require("hat");

exports.users = new Enmap({ name: "users" });
exports.articles = new Enmap({ name: "articles" });
exports.comments = new Enmap({ name: "comments" });
exports.logs = new Enmap({ name: "logs" });
exports.settings = new Enmap({ name: "settings" });

exports.generateToken = (username) => {
  const token = hat();
  this.users.set(username, token, "apiToken");
  return token;
};

exports.login = (username, password) => {
  const user = this.users.get(username);
  if (!user) return new Promise(resp => resp(false));
  if (!password) return new Promise(resp => resp(false));
  return bcrypt.compare(password, user.password);
};

exports.newuser = (username, name, plainpw, admin = false) => {
  if (this.users.has(username)) throw Error(`User ${username} already exists!`);
  const score = scorePassword(plainpw);
  if (score < 30) throw new Error(`Your password is too weak, and cannot be used.`);
  bcrypt.hash(plainpw, 10, (err, password) => {
    if (err) throw err;
    this.users.set(username, {
      username, name, password, admin, avatar: null, created: Date.now()
    });
  });
};

exports.getUser = (username, clean = true) => {
  if (!this.users.has(username)) return null;
  const user = this.users.get(username);
  if (clean) delete user.password;
  return user;
};

exports.getUsers = (clean = false) => this.users.map(user => this.getUser(user.username, clean));

exports.getArticle = (id) => {
  if (!this.articles.has(id)) return null;
  const article = this.articles.get(id);
  const comments = this.getComments(id);
  article.account = this.getUser(article.user, true);
  article.rendered = marked(article.content);
  article.comments = comments;
  return article;
};

exports.getArticles = (publishedOnly = false) => {
  const articles = publishedOnly ? this.articles.filter(a => a.published) : this.articles;
  const parsed = articles.keyArray().map(this.getArticle).sort((prev, curr) => curr.date - prev.date, 0);
  return parsed;
};

exports.addArticle = (title, content, user, published = false) => {
  const id = this.articles.autonum;
  this.articles.set(id, { id, content, title, published, date: Date.now(), user });
  return id;
};

exports.getComment = (id) => {
  if (!this.comments.has(id)) return null;
  const comment = this.comments.get(id);
  comment.account = this.getUser(comment.user, true);
  comment.rendered = marked(comment.content);
  return comment;
};

exports.getComments = (article) => {
  const comments = this.comments.filter(comment => comment.parent === article);
  const parsed = comments.keyArray().map(this.getComment);
  return parsed;
};

exports.formatDate = (timestamp) => {
  const date = new Date(timestamp),
    year = date.getFullYear(),
    month = `0${date.getMonth() + 1}`,
    day = date.getDate(),
    hours = date.getHours(),
    minutes = `0${date.getMinutes()}`,
    seconds = `0${date.getSeconds()}`;

  return `${day}-${month}-${year} ${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
};

// https://stackoverflow.com/questions/948172/password-strength-meter
function scorePassword(pass) {
  let score = 0;
  if (!pass) {
    return score;
  }

  // award every unique letter until 5 repetitions
  const letters = {};
  for (let i = 0; i < pass.length; i++) {
    letters[pass[i]] = (letters[pass[i]] || 0) + 1;
    score += 5.0 / letters[pass[i]];
  }

  // bonus points for mixing it up
  const variations = {
    digits: /\d/.test(pass),
    lower: /[a-z]/.test(pass),
    upper: /[A-Z]/.test(pass),
    nonWords: /\W/.test(pass)
  };

  let variationCount = 0;
  for (const check in variations) {
    variationCount += variations[check] == true ? 1 : 0;
  }
  score += (variationCount - 1) * 10;

  return parseInt(score);
}
