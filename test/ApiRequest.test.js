'use strict'

const assert = require('chai').assert
const nock = require('nock')
const ApiRequest = require('../lib/ApiRequest')
const config = require('../config')
const SHOWS_MOCK = {
  'id': 117313,
  'name': '2019-05-09',
  'show': {
    'id': 13765
  }
}

const CORRECT_CONFIG = {
  API_URL: config.get('API_URL'),
  API_DELAY: config.get('API_DELAY')
}

describe('ApiRequest instance', function() {
  it('should instantiate with config', function() {
    assert((new ApiRequest(CORRECT_CONFIG)) instanceof ApiRequest)
  })

  it('should fail without config', function() {
    assert.throws(function() {
      new ApiRequest()
    }, 'Options is not an object')
  })

  it('should fail without API_URL option', function() {
    assert.throws(function() {
      new ApiRequest({
        API_DELAY: 1
      })
    }, 'missing API_URL option')
  })

  it('should fail with empty API_URL option', function() {
    assert.throws(function() {
      new ApiRequest({
        API_DELAY: 1,
        API_URL: ''
      })
    }, 'API_URL is empty')
  })
})

describe('ApiRequest functions', function() {

  nock(CORRECT_CONFIG.API_URL)
    .persist()
    .get('/')
    .reply(200, SHOWS_MOCK)

  it('should request upcoming shows', function(done) {
    const apiRequest = new ApiRequest(CORRECT_CONFIG)
    apiRequest.getShows()
      .then(function(result) {
        assert.deepEqual(JSON.parse(result), SHOWS_MOCK, 'Wrong API response')
        done()
      }).catch(function(err) {
        console.error(err);
        done(err)
      })
  })
})
