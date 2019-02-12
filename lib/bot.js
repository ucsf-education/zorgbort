'use strict';
if (!process.env.SLACK_CLIENT_ID) {
  throw new Error('Error: Specify SLACK_CLIENT_ID in environment');
}
if (!process.env.SLACK_CLIENT_SECRET) {
  throw new Error('Error: Specify SLACK_CLIENT_SECRET in environment');
}
if (!process.env.SLACK_SIGNING_SECRET) {
  throw new Error('Error: Specify SLACK_SIGNING_SECRET in environment');
}
const PORT = process.env.PORT || 80;

const Botkit = require('botkit');

const options = {
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_SIGNING_SECRET,
  debug: false,
  scopes: ['bot'],
};

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGODB_URI) {
  const mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGODB_URI});
  options.storage = mongoStorage;
} else {
  options.json_file_store = __dirname + '/../.data/db/'; // store user data in a simple JSON format
}


const controller = Botkit.slackbot(options);

controller.setupWebserver(PORT, function (err, webserver) {
  if (err) console.error(err);
  controller.createWebhookEndpoints(webserver);
  controller.createOauthEndpoints(webserver);

  webserver.get('*', function (req, res) {
    res.status(404).send('What are you even doing here?');
  });
});

controller.startTicking();

module.exports = controller;
