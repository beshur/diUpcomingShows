'use strict'

// Post throttler
const assert = require('assert').strict

class PostThrottler {
  constructor(options) {

    assert(typeof options === 'object', 'options is not an object')
    assert(typeof options.maxParts === 'number', 'maxParts option is not a number')
    assert(typeof options.log === 'function', 'log option is not a function')

    this.log = options.log
    this.maxParts = options.maxParts

    this.throttle = this.throttle.bind(this)
  }

  throttle() {
    return this._getRandomArbitrary(1, this.maxParts) !== 1
  }

  /**
   * Returns a random number between min (inclusive) and max (inclusive)
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
   */
  _getRandomArbitrary(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
  }
}


module.exports = PostThrottler