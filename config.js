'use strict'

const _ = require('underscore')
const nconf = require('nconf')

const DEFAULTS = {
  PORT: 3000,
  API_URL: 'https://di.fm',
  API_DELAY: 3600000,
  CHANNELS_KEYS: {
    'trance': [
      'trance'
    ],
    'vocaltrance': [
      'trance',
    ],
    'epictrance': [
      'trance',
    ],
    'classictrance': [
      'trance',
    ],
    'goapsy': [
      'trance',
    ],
  },
  KEYS_HOOKS: {
    'trance': [ 'https://fake.discordapp.com/api/webhooks/1', 'https://fake.discordapp.com/api/webhooks/2' ]
  },
  NOTIFY_BEFORE: 60000,
  HOOK_NAME: 'DI.FM Shows',
  HOOK_AVATAR: 'https://buznik.net/di/avatar.png',
  ENABLED: 1,
  THROTTLE_MAX: 1
}

nconf.env({
    whitelist: _.keys(DEFAULTS),
    parseValues: true
  }).argv()
  .defaults(DEFAULTS)


module.exports = nconf