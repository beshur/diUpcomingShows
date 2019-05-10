/* DI Upcoming shows */
'use strict'

const express = require('express')
const app = express()

const PORT = parseInt(process.env.APP_PORT)
const API_URL = process.env.API_URL
const API_DELAY = parseInt(process.env.API_DELAY)
console.log(process.env.KEYS_HOOKS)
const KEYS_HOOKS = JSON.parse(process.env.KEYS_HOOKS)
const NOTIFY_BEFORE = parseInt(process.env.NOTIFY_BEFORE)

const ApiRequest = require('./lib/apiRequest')
const NotifyHooks = require('./lib/NotifyHooks')

app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))


let apiRequest = new ApiRequest({
  API_URL,
  API_DELAY
})
let notifyHooks = new NotifyHooks({
  API_DELAY,
  KEYS_HOOKS,
  NOTIFY_BEFORE
})

apiRequest.getShowsAndResetTimer()


apiRequest.on('upcoming', notifyHooks.onUpcomingShows)