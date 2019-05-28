'use strict'

const assert = require('assert').strict

class NotificationPayloadGenerator {
  constructor(options) {

    assert(typeof options === 'object', 'options is not an object')
    assert(typeof options.hookAvatar === 'string', 'hookAvatar option is not a string')
    assert(typeof options.hookName === 'string', 'hookName option is not a string')

    this.options = options
  }

  generate(show) {
    return {
      content: this._generateMessageContent(show),
      username: this.options.hookName,
      avatar_url: this.options.hookAvatar
    }
  }

  _generateMessageContent(show) {
    let url = 'https://www.di.fm/shows/' + show.show.slug
    return show.show.name + ' ' + show.artists_tagline + ' starts in a minute!\n' + url 
  }
}

module.exports = NotificationPayloadGenerator
