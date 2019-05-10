// request
'use strict'

const EventEmitter = require('events')
const request = require('request-promise-native')
const assert = require('assert').strict

class ApiRequest extends EventEmitter {
  constructor(options) {
    super(options)
    assert(typeof options === 'object')
    assert(options.API_URL.length > 0)
    assert(options.API_DELAY > 0)

    this.options = options
    this.timer = null

    this.getShowsAndResetTimer = this.getShowsAndResetTimer.bind(this)
  }

  getShows() {
    return request.get(this.options.API_URL)
  }

  getShowsAndResetTimer() {
    let upcoming;
    return new Promise((resolve, reject) => {
      this.getShows()
        .then(result => {
          this.resetTimer()
          this.emit('upcoming', result)
          resolve(result)
        })
        .catch(err => {
          reject(err);
        })
    });
  }

  resetTimer() {
    clearTimeout(this.timer)
    this.timer = setTimeout(this.getShowsAndResetTimer, this.options.API_DELAY)
  }

  stopTimer() {
    clearTimeout(this.timer)
  }
}

module.exports = ApiRequest
