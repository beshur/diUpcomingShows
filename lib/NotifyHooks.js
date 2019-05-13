// request
'use strict'

const request = require('request-promise-native')
const assert = require('assert').strict

class NotifyHooks {
	constructor(options) {
    assert(typeof options === 'object', 'options is not a object')
    assert(typeof options.show === 'object', 'show option is not a object')
    assert(Array.isArray(options.hooks), 'hooks option is not an Array')

    this.options = options
    this.logger = console.log.bind(this, 'NotifyHooks')
    this.notify = this.notify.bind(this)
	}

  notify() {
    this.logger('notify', this.options.show.id)
    this.options.hooks.forEach(url => {
      request.post(this._reqParams(url))
        .then(result => {
          this.logger('Notified yay', this.options.show.id, result)
        })
        .catch(err => {
          this.logger('Something went wrong', err)
        })
    })
  }

  _reqParams(url) {
    return {
      method: 'POST',
      uri: url,
      body: {
          content: this._generateMessageContent(this.options.show),
          username: 'DI.FM Shows',
          avatar_url: 'https://buznik.net/di/avatar.png'
      },
      json: true
    };
  }

  _generateMessageContent(show) {
    let url = 'https://www.di.fm/shows/' + show.show.slug + '/episodes/' + show.slug
    return show.show.name + ' ' + show.artists_tagline + ' starts in a minute!\n' + url 
  }
}


module.exports = NotifyHooks