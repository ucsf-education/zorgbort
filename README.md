# ZORGBORT (an Ilios bot)

Zorgbort is going to make common tasks easier to do.

## Running Locally:

You'll need a publicly-accessible address to configure Slack OAuth. You can create a tunnel with [https://ngrok.com](https://ngrok.com) and run `ngrok http 3000` to connect.

You'll need to configure a Slack app to test with at [https://api.slack.com/apps](https://api.slack.com/apps). This will give you the details you need to authenticate the app.

1. `git clone zorgbort`
2. `pnpm install`
3. add these variables to your environment:
```bash
SLACK_SIGNING_SECRET="SECRET"
SLACK_BOT_TOKEN="TOKEN"
GITHUB_TOKEN="TOKEN"
VALID_RELEASE_USERS="SLACKID,SLACKID2"
PORT=3000
```
4. Run ZORGBORT with `pnpm start`

## Acknowledgments

* Release Notes idea and format from [github-changelog-generator](https://github.com/skywinder/github-changelog-generator)
