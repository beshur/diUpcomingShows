'use strict'

const _ = require('underscore')
const assert = require('assert').strict

class NotificationFactory {
  constructor(options) {

    assert(typeof options === 'object',
      'options is not a object')
    assert(typeof options.log === 'function',
      'log option is not a function')
    assert(typeof options.NotificationTimer === 'function',
      'NotificationTimer option is not a function')
    assert(typeof options.NotifyHooks === 'function',
      'NotifyHooks option is not a function')
    assert(typeof options.notificationPayloadGenerator === 'object',
      'notificationPayloadGenerator option is not an object')

    this.log = options.log.bind(this, 'NotificationFactory')
    this.options = options
    this.timers = []

    this._alreadySet = this._alreadySet.bind(this)
    this._destroyTimer = this._destroyTimer.bind(this)
    this.report = this.report.bind(this)
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
    let id
    try {
      id = options.show.id
    } catch(err) {
      this.log('wrong options schedule', err)
      return 0
    }
    if (this._alreadySet(id)) {
      this.log('show already scheduled', id)
      return 0
    }
    let timerOptions
    let notificationOptions = {
      show: options.show,
      hooks: options.hooks,
      bodyGenerator: this.options.notificationPayloadGenerator
    }
    let notifyHook = this._createNotification(notificationOptions)
    let timer
    if (!notifyHook) {
      return 0
    }

    timerOptions = {
      id: id,
      notifyHooks: notifyHook,
      delay: options.delay,
      destroy: this._destroyTimer
    }

    timer = this._createTimer(timerOptions)

    if (!timer) {
      return 0
    }

    this.timers.push(timer)
    return id
  }

  report() {
    return this.timers.map(timer => timer.report())
  }

  destroy() {
    this.timers.forEach(timer => this._destroyTimer(timer))
  }

  _createNotification(options) {
    try {
      return new this.options.NotifyHooks(options)
    } catch(err) {
      this.log('Failed to create NotifyHooks', err, options)
      return
    }
  }

  _createTimer(options) {
    try {
      return new this.options.NotificationTimer(options)
    } catch(err) {
      this.log('Failed to create NotificationTimer', err, options)
      return
    }
  }

  _destroyTimer(timer) {
    this.log('_destroyTimer', timer.id)
    timer.clear()
    this.timers = _.without(this.timers, timer)
  }

  _alreadySet(showId) {
    return this.timers.findIndex(timer => timer.id === showId) > -1
  }
}

module.exports = NotificationFactory
