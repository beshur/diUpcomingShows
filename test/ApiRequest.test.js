'use strict'

const chai = require('chai')
const ApiRequest = require('../lib/ApiRequest')
const config = require('../config')

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




