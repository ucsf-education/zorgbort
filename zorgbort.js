'use strict';
require('dotenv').config();

const bot = require('./lib/bot.js');

require('./src/releases.js')(bot);
require('./src/conversation.js')(bot);
