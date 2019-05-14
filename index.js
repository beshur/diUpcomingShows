/* DI Upcoming shows */
'use strict'

const express = require('express')
const app = express()
const config = require('./config')

const ApiRequest = require('./lib/ApiRequest')
const RequestRepeater = require('./lib/RequestRepeater')
const ShowsParser = require('./lib/ShowsParser')
const NotifyHooks = require('./lib/NotifyHooks')
const NotificationTimer = require('./lib/NotificationTimer')
const NotificationPayloadGenerator = require('./lib/NotificationPayloadGenerator')
const NotificationFactory = require('./lib/NotificationFactory')

app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(config.get('PORT'), () => console.log(`Example app listening on port ${config.get('PORT')}!`))


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
  NotificationTimer: NotificationTimer,
  NotifyHooks: NotifyHooks,
  notificationPayloadGenerator: notificationPayloadGenerator
})
let showsParser = new ShowsParser({
  keysHooks: config.get('KEYS_HOOKS'),
  delay: config.get('API_DELAY'),
  notifyBefore: config.get('NOTIFY_BEFORE'),
  notificationFactory
})

apiRequestRepeater.requestAndRepeat()
apiRequestRepeater.on('result', function(result, error) {
  console.log('apiRequestRepeater error', error)
  showsParser.onUpcomingShows(result)
})