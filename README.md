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
BOT_TOKEN="TOKEN"
CLIENT_ID="CLIENTID"
CLIENT_SECRET="SECRET"
CLIENT_SIGNING_SECRET="SIGNING_SECRET"
VERIFICATION_TOKEN="VERIFICATION_TOKEN"
GITHUB_TOKEN="TOKEN"
SSH_KEY_PASSPHRASE="ZORGBORT Passphrase"
SSH_PRIVATE_KEY="ZORGBORT KEYFILE Contents"
SSH_PUBLIC_KEY="ZORGBORT PUBLICKEY Contents"
VALID_RELEASE_USERS="SLACKID,SLACKID2"
PORT=8899
```
4. Run ZORBORT with `nodemon app.js`


## Acknowledgments

* Release Notes idea and format from [github-changelog-generator](https://github.com/skywinder/github-changelog-generator)
