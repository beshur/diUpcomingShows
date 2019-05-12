'use strict'

const EventEmitter = require('events')
const assert = require('assert')

class RequestRepeater extends EventEmitter {
  constructor(options) {
    super(options)

    assert(typeof options === 'object', 'options is not an object')
    assert(typeof options.request === 'function', 'request option is not a function')
    assert(typeof options.delay === 'number', 'delay option is not a number')

    this.options = options
    this.timer = null
    this.requestAndRepeat = this.requestAndRepeat.bind(this)
    this.onError = this.onError.bind(this)
  }

  requestAndRepeat() {
    this.options.request()
      .then((result) => {
        this.resetTimer(this.requestAndRepeat, this.options.delay)
        this.onResult(result)
      })
      .catch(this.onError)
  }

  onResult(result) {
    this.emit('result', result)    
  }

  onError(err) {
    this.emit('result', null, err)
  }

  resetTimer(action, delay) {
    clearTimeout(this.timer)
    this.timer = setTimeout(action, delay)
  }

  stopTimer() {
    clearTimeout(this.timer)
  }
}

module.exports = RequestRepeater
