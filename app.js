require('dotenv').config();
const { App } = require('@slack/bolt');
const Home = require('./src/home');

// Initializes app with bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

try {
  new Home(app);
}
catch (error) {
  console.error(error);
}


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
