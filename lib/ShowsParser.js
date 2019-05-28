'use strict'

const assert = require('assert').strict
const moment = require('moment')
const _ = require('underscore')

class ShowsParser {
  constructor(options) {
    assert(typeof options === 'object', 'options is not an object')
    assert(typeof options.log === 'function', 'log option is not a function')
    assert(typeof options.notificationFactory === 'object', 'notificationFactory option is not an object')
    assert(typeof options.keysHooks === 'object', 'keysHooks option is not an object')
    assert(typeof options.notifyBefore === 'number', 'notifyBefore option is not a number')
    assert(typeof options.delay === 'number', 'delay option is not a number')
    assert(typeof options.postThrottler === 'object', 'postThrottler option is not an object')

    this.log = options.log.bind(this, 'ShowsParser')
    this.options = options

    this.onUpcomingShows = this.onUpcomingShows.bind(this)
    this._parseShow = this._parseShow.bind(this)
    this._getChannelsToNotify = this._getChannelsToNotify.bind(this)
  }

  onUpcomingShows(upcoming) {
    let upcomingJson
    try {
      upcomingJson = JSON.parse(upcoming)
    } catch(err) {
      this.log('Probably not JSON from API', err)
      return;
    }
    this.log('parsed shows: ', upcomingJson.length)
    upcomingJson.forEach(this._parseShow)
  }

  _parseShow(show) {
    this.log('parseShow')
    let startsAt = moment.parseZone(show.start_at).local()
    let startsAtUnix = startsAt.valueOf()
    let now = moment().valueOf()
    let notificationDelay = startsAtUnix - now - this.options.notifyBefore
    let hooks = this._getChannelsToNotify(show)
    
    let underNextApiCall = (notificationDelay > 0 && notificationDelay < this.options.delay)
    let throttle = this.options.postThrottler.throttle()

    this.log('underNextApiCall', show.id, underNextApiCall, notificationDelay, 'throttle:', throttle)

    if (underNextApiCall && hooks.length && !throttle) {
      this.log('schedule', show.id)
      return this.options.notificationFactory.schedule({
        show,
        hooks,
        delay: notificationDelay
      })
    } else {
      return 0
    }
  }

  _getChannelsToNotify(show) {
    let hooks = this.options.keysHooks;

    // check which channels this one belongs to
    let showChannels = show.show.channels.map(channelInfo => channelInfo.key)
    let postToChannels = []

    _.each(hooks, (hooksUrls, hookChannelKey) => {
      if (_.contains(showChannels, hookChannelKey)) {
        postToChannels = postToChannels.concat(hooksUrls)
      }
    })
    this.log('_getChannelsToNotify', show.id, 'showChannels', postToChannels.length)

    return postToChannels
  }

}

module.exports = ShowsParser
