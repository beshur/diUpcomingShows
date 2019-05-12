// request
'use strict'

const request = require('request-promise-native')
const assert = require('assert').strict

class ApiRequest {
  constructor(options) {
    assert(typeof options === 'object', 'Options is not an object')
    assert(typeof options.API_URL !== 'undefined', 'missing API_URL option')
    assert(options.API_URL.length > 0, 'API_URL is empty')

    this.options = options

    this.getShows = this.getShows.bind(this)
  }

  getShows() {
    return request.get(this.options.API_URL)
  }
}

module.exports = ApiRequest
