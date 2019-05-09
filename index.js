/* DI Upcoming shows */
'use strict'

const express = require('express')
const app = express()

const PORT = process.env.APP_PORT
const API_URL = process.env.API_URL
const API_DELAY = process.env.API_DELAY
const KEYS_HOOKS = process.env.KEYS_HOOKS

const ApiRequest = require('./lib/apiRequest')

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))


let apiRequest = new ApiRequest({
  API_URL,
  API_DELAY
})


apiRequest.on('upcoming', (result) => {
  console.log('upcoming', result);
})