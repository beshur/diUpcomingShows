'use strict'

const assert = require('assert').strict

class NotificationTimer {
  /*
   @param object options
   @param object options.notifyHooks
   @param {number} options.id
   @param number options.delay
   @param function options.destroy
  */
  constructor(options) {
    assert(typeof options === 'object', 'options is not an object')
    assert(typeof options.notifyHooks === 'object', 'notifyHooks option is not a object')
    assert(typeof options.delay === 'number', 'delay option is not a number')
    assert(typeof options.destroy === 'function', 'destroy option is not a function')

    this.logger = console.log.bind(this, 'NotificationTimer')
    this.options = options
    this.id = options.id
    this.createdAt = new Date()
    this.clear = this.clear.bind(this)
    this.report = this.report.bind(this)

    this.timer = this._setTimer(options)
  }

  report() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      delay: this.options.delay
    }
  }

  clear() {
    clearTimeout(this.timer)
  }

  _setTimer(options) {
    this.logger('init', this.id, 'in', options.delay)
    return setTimeout(() => {
      options.notifyHooks.notify()
      options.destroy(this)
    }, options.delay)
  }
}


module.exports = NotificationTimer
