/* DI Upcoming shows */
'use strict'

const express = require('express')
const app = express()
const config = require('./config')

const ApiRequest = require('./lib/ApiRequest')
const RequestRepeater = require('./lib/RequestRepeater')
const NotifyHooks = require('./lib/NotifyHooks')

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
let notifyHooks = new NotifyHooks({
  API_DELAY: config.get('API_DELAY'),
  KEYS_HOOKS: config.get('KEYS_HOOKS'),
  NOTIFY_BEFORE: config.get('NOTIFY_BEFORE')
})

apiRequestRepeater.requestAndRepeat()
apiRequestRepeater.on('result', function(result, error) {
  console.log('apiRequestRepeater error', error)
  notifyHooks.onUpcomingShows(result)
})