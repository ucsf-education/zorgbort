import slackBolt from '@slack/bolt';
const { App, AwsLambdaReceiver } = slackBolt;
import Home from './src/home.js';
import Conversation from './src/conversation.js';

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes app with bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
  // The `processBeforeResponse` option is required for all Function as a Service (FaaS)
  // environments. It allows Bolt methods (e.g. `app.message`) to handle a Slack request
  // before the Bolt framework responds to the request (e.g. `ack()`). This is
  // important because FaaS immediately terminate handlers after the response.
  processBeforeResponse: true,
});

try {
  new Home(app);
  new Conversation(app);
} catch (error) {
  console.error(error);
}

export async function handler(event, context, callback) {
  const handler = await app.start();
  return handler(event, context, callback);
}
