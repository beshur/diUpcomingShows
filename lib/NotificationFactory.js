'use strict'

const _ = require('underscore')
const assert = require('assert').strict

class NotificationFactory {
  constructor(options) {
    this.logger = console.log.bind(this, 'NotificationFactory')

    assert(typeof options === 'object',
      'options is not a object')
    assert(typeof options.NotificationTimer === 'function',
      'NotificationTimer option is not a function')
    assert(typeof options.NotifyHooks === 'function',
      'NotifyHooks option is not a function')
    assert(typeof options.notificationPayloadGenerator === 'object',
      'notificationPayloadGenerator option is not an object')

    this.options = options
    this.timers = []

    _.bind(this._destroyTimer, this)
  }

  /**
   * Timer params
   * @typedef {Object} TimerOptions
   * @property {object} show - The show
   * @property {Array} hooks - The hooks to notify array
   * @property {number} delay - Delay to fire in milliseconds
   */

  /*
    @param {TimerOptions} options
  */
  schedule(options) {
    if (this._alreadySet(options.id)) {
      this.logger('show already scheduled', options.id)
      return
    }

    let notificationOptions = {
      show: options.show,
      hooks: options.hooks,
      bodyGenerator: this.options.notificationPayloadGenerator
    }

    let timerOptions = {
      id: options.show.id,
      notifyHooks: this._createNotification(notificationOptions),
      delay: options.delay,
      destroy: this._destroyTimer
    }

    this.timers.push(this._createTimer(timerOptions))
  }

  _createNotification(options) {
    try {
      return new this.options.NotifyHooks(options)
    } catch(err) {
      this.logger('Failed to create NotifyHooks', err, options)
    }
  }

  _createTimer(options) {
    try {
      return new this.options.NotificationTimer(options)
    } catch(err) {
      this.logger('Failed to create NotificationTimer', err, options)
    }
  }

  _destroyTimer(timer) {
    timer.clear()
    this.timers = _.without(this.timers, timer)
  }

  _alreadySet(showId) {
    return this.timers.find(timer => timer.id === showId)
  }
}

module.exports = NotificationFactory
