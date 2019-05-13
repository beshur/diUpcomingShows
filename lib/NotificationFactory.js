'use strict'

const _ = require('underscore')

const NotifyHooks = require('./NotifyHooks')
const NotificationTimer = require('./NotificationTimer')

class NotificationFactory {
  constructor() {
    this.logger = console.log.bind(this, 'NotificationFactory')

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
      hooks: options.hooks
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
      return new NotifyHooks(options)
    } catch(err) {
      this.logger('Failed to create NotifyHooks', err)
    }
  }

  _createTimer(options) {
    try {
      return new NotificationTimer(options)
    } catch(err) {
      this.logger('Failed to create NotificationTimer', err)
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
