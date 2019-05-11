'use strict'

const chai = require('chai')
const nock = require('nock')
const ApiRequest = require('../lib/ApiRequest')
const config = require('../config')
const SHOWS_MOCK = {
  'id': 117313,
  'name': "2019-05-09",
  'show': {
    'id': 13765
  }
}

const CORRECT_CONFIG = {
  API_URL: config.get('API_URL'),
  API_DELAY: config.get('API_DELAY')
}

console.log('CORRECT_CONFIG', CORRECT_CONFIG)

describe('ApiRequest instance', function() {
  it('should instantiate with config', function() {
    const apiRequest = new ApiRequest(CORRECT_CONFIG)
  })

  it('should fail without config', function() {
    chai.assert.throws(function() {
      const apiRequest = new ApiRequest()
    }, 'Options is not an object')
  })

  it('should fail without API_URL option', function() {
    chai.assert.throws(function() {
      const apiRequest = new ApiRequest({
        API_DELAY: 1
      })
    }, 'missing API_URL option')
  })

  it('should fail with empty API_URL option', function() {
    chai.assert.throws(function() {
      const apiRequest = new ApiRequest({
        API_DELAY: 1,
        API_URL: ''
      })
    }, 'API_URL is empty')
  })

  it('should fail without API_DELAY option', function() {
    chai.assert.throws(function() {
      const apiRequest = new ApiRequest({
        API_URL: '1'
      })
    }, 'API_DELAY option should be a number')
  })

  it('should fail with API_DELAY less than 1', function() {
    chai.assert.throws(function() {
      const apiRequest = new ApiRequest({
        API_URL: '1',
        API_DELAY: 0
      })
    }, 'API_DELAY should be greater than 0')
  })
})

describe('ApiRequest functions', function() {
  const scope = nock(CORRECT_CONFIG.API_URL)
    .get('/')
    .reply(200, SHOWS_MOCK)

  it('should request upcoming shows', function(done) {
    const apiRequest = new ApiRequest(CORRECT_CONFIG)
    apiRequest.getShows()
      .then(function(result) {
        chai.assert.deepEqual(JSON.parse(result), SHOWS_MOCK, 'Wrong API response')
        done()
      }).catch(function(err) {
        console.error(err);
        done(err)
      })
  })
})


