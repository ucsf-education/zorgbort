# ZORGBORT (an ilios bot) [![Build Status](https://travis-ci.org/ucsf-ckm/zorgbort.svg?branch=master)](https://travis-ci.org/ucsf-ckm/zorgbort)

Zorgbort is going to make common tasks easier to do.

## Running Locally:

1. Install node and npm
2. `git clone zorgbort`
3. `npm install`
4. add a `.env` file with:
```bash
SLACK_TOKEN="TOKEN"
GITHUB_TOKEN="TOKEN"
SSH_KEY_PASSPHRASE="ZORGBORT Passphrase"
SSH_PRIVATE_KEY="ZORGBORT KEYFILE Contents"
SSH_PUBLIC_KEY="ZORGBORT PUBLICKEY Contents"
VALID_RELEASE_USERS="SLACKID,SLACKID2"
```
5. Run ZORBORT with `npm start`
5. test ZORBORT with `npm test`


## Deploying to heroku
1. Install the heroku CLI (`brew install heroku`)
2. `heroku create`
3. `git push heroku master`
4. `heroku config:set SLACK_TOKEN="TOKEN"`
5. `heroku config:set GITHUB_TOKEN="TOKEN"`
6. `heroku config:set SSH_KEY_PASSPHRASE="ZORGBORT Passphrase"`
7. `heroku config:add SSH_PRIVATE_KEY="$(cat KEYFILE)"`
7. `heroku config:add SSH_PUBLIC_KEY="$(cat PUBLICKEYFILE)"`
8. `heroku config:set VALID_RELEASE_USERS="SLACKID,SLACKID2"`

## Acknowledgments

* Release Notes idea and format from [github-changelog-generator](https://github.com/skywinder/github-changelog-generator)
