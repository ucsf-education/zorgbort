'use strict';
require('dotenv').config();

const bot = require('./lib/bot.js');

require('./src/releases.js')(bot);
require('./src/releaseAndTag.js')(bot);
require('./src/dogs.js')(bot);
require('./src/conversation.js')(bot);
