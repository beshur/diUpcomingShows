'use strict'

const nconf = require('nconf')

const DEFAULTS = {
  PORT: 3000,
  API_URL: 'https://di.fm',
  API_DELAY: 3600000,
  KEYS_HOOKS: {
    'trance': ['https://discordapp.com']
  },
  NOTIFY_BEFORE: 60000
}

nconf.env({
    whitelist: ['PORT', 'API_URL', 'API_DELAY', 'KEYS_HOOKS', 'NOTIFY_BEFORE'],
    parseValues: true
  }).argv()
  .defaults(DEFAULTS)


module.exports = nconf