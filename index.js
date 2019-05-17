/* DI Upcoming shows */
'use strict'

const express = require('express')
const app = express()
const _ = require('underscore')

const config = require('./config')
const ApiRequest = require('./lib/ApiRequest')
const RequestRepeater = require('./lib/RequestRepeater')
const ShowsParser = require('./lib/ShowsParser')
const NotifyHooks = require('./lib/NotifyHooks')
const NotificationTimer = require('./lib/NotificationTimer')
const NotificationPayloadGenerator = require('./lib/NotificationPayloadGenerator')
const NotificationFactory = require('./lib/NotificationFactory')
const PostThrottler = require('./lib/PostThrottler')
// temp
const log = console.log

// init
/*
 * getKeysHooks
 * merge two objects through a foreign key
 */
let getKeysHooks = (channelsKeys, keysHooks) => {
  let result = {}
  if (_.isObject(channelsKeys) && _.isObject(keysHooks)) {
    result = _.clone(channelsKeys)
    _.each(result, (foreignKeys, channel) => {
      let tempKeys = _.clone(foreignKeys)
      result[channel] = []
      tempKeys.forEach(key => {
        result[channel] = result[channel].concat(keysHooks[key])
      })
    })
  }
  return result
}

let postThrottler = new PostThrottler({
  log,
  maxParts: config.get('THROTTLE_MAX')
})
let apiRequest = new ApiRequest({
  API_URL: config.get('API_URL')
})
let apiRequestRepeater = new RequestRepeater({
  request: apiRequest.getShows,
  delay: config.get('API_DELAY')
})
let notificationPayloadGenerator = new NotificationPayloadGenerator({
  hookAvatar: config.get('HOOK_AVATAR'),
  hookName: config.get('HOOK_NAME')
})
let notificationFactory = new NotificationFactory({
  log,
  NotificationTimer: NotificationTimer,
  NotifyHooks: NotifyHooks,
  notificationPayloadGenerator: notificationPayloadGenerator
})
let showsParser = new ShowsParser({
  log,
  keysHooks: getKeysHooks(config.get('CHANNELS_KEYS'), config.get('KEYS_HOOKS')),
  delay: config.get('API_DELAY'),
  notifyBefore: config.get('NOTIFY_BEFORE'),
  postThrottler,
  notificationFactory
})

// app start
log('ENABLED', config.get('ENABLED'))
if (!config.get('ENABLED')) {
  return
}

app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/report', (req, res) => {
  let report = {
    uptime: process.uptime(),
    timers: notificationFactory.report()
  }
 
  if (req.xhr) {
    res.json(report)
  } else {
    res.send(report)
  }
})

app.listen(config.get('PORT'), () => console.log(`Example app listening on port ${config.get('PORT')}!`))


apiRequestRepeater.requestAndRepeat()
apiRequestRepeater.on('result', function(result, error) {
  console.log('apiRequestRepeater error', error)
  showsParser.onUpcomingShows(result)
})
