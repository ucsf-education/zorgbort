# ZORGBORT (an Ilios bot)

Zorgbort is going to make common tasks easier to do.

## Running Locally:

You'll need a publicly accessible address to configure slack oauth
You can create a tunnel with https://ngrok.com 
and run  `ngrok http 3000` to connect

You'll need to configure a Slack app to test with at https://api.slack.com/apps
This will give you the details to fill in for your `.env` file.

1. `git clone zorgbort`
2. `npm install`
3. add a `.env` file with:
```bash
SLACK_SIGNING_SECRET="SECRET"
SLACK_BOT_TOKEN="TOKEN"
GITHUB_TOKEN="TOKEN"
VALID_RELEASE_USERS="SLACKID,SLACKID2"
PORT=3000
```
4. Run ZORBORT with `npm start`


## Acknowledgments

* Release Notes idea and format from [github-changelog-generator](https://github.com/skywinder/github-changelog-generator)
