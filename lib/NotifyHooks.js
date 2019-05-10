// request
'use strict'

const EventEmitter = require('events')
const request = require('request-promise-native')
const moment = require('moment')
const assert = require('assert').strict
const _ = require('underscore')

class NotifyHooks extends EventEmitter {
	constructor(options) {
		super()

    assert(typeof options.KEYS_HOOKS === 'object')
    assert(typeof options.NOTIFY_BEFORE === 'number')
    assert(typeof options.API_DELAY === 'number')
    this.options = options
    this.timers = []

    this.onUpcomingShows = this.onUpcomingShows.bind(this)
    this.parseShows = this.parseShows.bind(this)
    this.onShowTimer = this.onShowTimer.bind(this)
    this.notify = this.notify.bind(this)
	}

	onUpcomingShows(upcoming) {
    let upcomingJson
    try {
      upcomingJson = JSON.parse(upcoming)
    } catch(err) {
      console.error('Probably not JSON from API', err)
      return;
    }
    console.log('parsed %s shows', upcomingJson.length)
    upcomingJson.forEach(this.parseShows)
	}

  parseShows(show) {
    console.log('parseShows')
    let startsAt = moment.parseZone(show.start_at).local()
    let startsAtUnix = startsAt.valueOf()
    let now = moment().valueOf()
    let notificationDelay = startsAtUnix - now - this.options.NOTIFY_BEFORE
    let underNextApiCall = (notificationDelay < this.options.API_DELAY)
    let alreadySet = null
    console.log('underNextApiCall', underNextApiCall, notificationDelay)

    if (underNextApiCall && notificationDelay > 0) {
      console.log('notificationDelay', notificationDelay)

      alreadySet = this.timers.find(timerObj => timerObj.id === show.id)
      if (!alreadySet) {
        this._createTimer(show, notificationDelay)
      }
    }
  }

  onShowTimer(show) {
    let hooks = this.options.KEYS_HOOKS;

    // check which channels this one belongs to
    let showChannels = show.show.channels.map(channelInfo => channelInfo.key)

    console.log('onShowTimer showChannels', showChannels)
    _.each(hooks, (hooksUrls, hookChannelKey) => {
      if (_.contains(showChannels, hookChannelKey)) {
        this.notify(show, hooksUrls)
      }
    })
  }

  _generateMessageContent(show) {
    let url = 'https://di.fm/shows/' + show.show.slug + '/episodes/' + show.slug
    return show.show.name + ' ' + show.artists_tagline + ' starts in a minute!\n' + url 
  }

  _createTimer(show, delay) {
    console.log('Creating timer', show.id, 'in', delay)
    let showTimer = setTimeout(this.onShowTimer, delay, show)
    let timerObj = {
      id: show.id,
      timer: showTimer
    }
    this.timers.push(showTimer)
  }

  notify(show, hooksUrls) {
    hooksUrls.forEach(url => {
      var options = {
        method: 'POST',
        uri: url,
        body: {
            content: this._generateMessageContent(show),
            username: 'DI.FM Shows',
            avatar_url: 'https://buznik.net/di/avatar.png'
        },
        json: true
      };

      request.post(options)
        .then(result => {
          console.log('Notified yay', result)
        })
        .catch(err => {
          console.log('Something went wrong', err)
        })
    })
  }
}


module.exports = NotifyHooks