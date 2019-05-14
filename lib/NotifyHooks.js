// request
'use strict'

const request = require('request-promise-native')
const assert = require('assert').strict

class NotifyHooks {
	constructor(options) {
    assert(typeof options === 'object', 'options is not an object')
    assert(typeof options.show === 'object', 'show option is not an object')
    assert(Array.isArray(options.hooks), 'hooks option is not an Array')
    assert(typeof options.bodyGenerator === 'object', 'bodyGenerator option is not an object')

    this.options = options
    this.logger = console.log.bind(this, 'NotifyHooks')
    this.notify = this.notify.bind(this)
    this._prepareRequests = this._prepareRequests.bind(this)
	}

  notify() {
    this.logger('notify', this.options.show.id)
    return new Promise((resolve, reject) => {
      Promise.all(this._prepareRequests())
        .then(result => {
          this.logger('Notified yay', this.options.show.id, result)
          resolve(result)
        })
        .catch(err => {
          this.logger('Something went wrong', err)
          reject(err)
        })
      })
  }

  _prepareRequests() {
    return this.options.hooks.map(url => {
      return request.post(this._reqParams(url))
    })
  }

  _reqParams(url) {
    return {
      method: 'POST',
      uri: url,
      body: this.options.bodyGenerator.generate(this.options.show),
      json: true
    }
  }
}


module.exports = NotifyHooks