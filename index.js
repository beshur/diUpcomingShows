/* DI Upcoming shows */
'use strict'

const express = require('express')
const app = express()
const config = require('./config')

const ApiRequest = require('./lib/apiRequest')
const NotifyHooks = require('./lib/NotifyHooks')

console.log('Hooks', config.get('KEYS_HOOKS'))

app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(config.get('PORT'), () => console.log(`Example app listening on port ${config.get('PORT')}!`))


let apiRequest = new ApiRequest({
  API_URL: config.get('API_URL'),
  API_DELAY: config.get('API_DELAY')
})
let notifyHooks = new NotifyHooks({
  API_DELAY: config.get('API_DELAY'),
  KEYS_HOOKS: config.get('KEYS_HOOKS'),
  NOTIFY_BEFORE: config.get('NOTIFY_BEFORE')
})

apiRequest.getShowsAndResetTimer()


apiRequest.on('upcoming', notifyHooks.onUpcomingShows)