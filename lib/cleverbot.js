if (!process.env.CLEVER_BOT_USER) {
  throw new Error('Error: Specify CLEVER_BOT_USER in environment');
}
if (!process.env.CLEVER_BOT_API_KEY) {
  throw new Error('Error: Specify CLEVER_BOT_API_KEY in environment');
}

const Cleverbot = require("cleverbot.io");
let clever = new Cleverbot(process.env.CLEVER_BOT_USER, process.env.CLEVER_BOT_API_KEY);
clever.setNick("zorgbort");
clever.create(err => {
  console.error(`cleverbot error: ${err}`);
});
module.exports = clever;
