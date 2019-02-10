# ZORGBORT (an ilios bot) [![Build Status](https://travis-ci.org/ucsf-ckm/zorgbort.svg?branch=master)](https://travis-ci.org/ucsf-ckm/zorgbort)

Zorgbort is going to make common tasks easier to do.

## Running Locally:

1. Install node and npm
2. `git clone zorgbort`
3. `npm install`
4. add a `.env` file with:
```bash
SLACK_TOKEN="TOKEN"
SLACK_CLIENT_ID="CLIENTID"
SLACK_CLIENT_SECRET="SECRET"
SLACK_SIGNING_SECRET="SECRET"
GITHUB_TOKEN="TOKEN"
SSH_KEY_PASSPHRASE="ZORGBORT Passphrase"
SSH_PRIVATE_KEY="ZORGBORT KEYFILE Contents"
SSH_PUBLIC_KEY="ZORGBORT PUBLICKEY Contents"
VALID_RELEASE_USERS="SLACKID,SLACKID2"
```
5. Run ZORBORT with `npm start`
5. test ZORBORT with `npm test`

## Heroku Deployment

### Install Heroku CLI

`brew tap heroku/brew && brew install heroku`

### Reading logs / Checking status
`heroku logs -t -a zorgbort`

### Restart
`heroku restart -a zorgbort`

## Deploying to heroku 

You shouldn't need to do this it happens automatically using heroku's github integration

1. `heroku create`
2. `git push heroku master`
3. `heroku config:set SLACK_TOKEN="TOKEN"`
4. `heroku config:set SLACK_CLIENT_ID="ID"`
5. `heroku config:set SLACK_CLIENT_SECRET="SECRET"`
6. `heroku config:set SLACK_SIGNING_SECRET="SECRET"`
7. `heroku config:set SSH_KEY_PASSPHRASE="ZORGBORT Passphrase"`
8. `heroku config:add SSH_PRIVATE_KEY="$(cat KEYFILE)"`
9. `heroku config:add SSH_PUBLIC_KEY="$(cat PUBLICKEYFILE)"`
10. `heroku config:set VALID_RELEASE_USERS="SLACKID,SLACKID2"`

## Acknowledgments

* Release Notes idea and format from [github-changelog-generator](https://github.com/skywinder/github-changelog-generator)
