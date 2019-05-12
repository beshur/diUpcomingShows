'use strict'

const assert = require('chai').assert
const nock = require('nock')
const sinon = require('sinon')
const RequestRepeater = require('../lib/RequestRepeater')
const config = require('../config')

const CORRECT_CONFIG = {
  API_DELAY: config.get('API_DELAY')
}
const stub = sinon.stub()
const MOCK_REQUEST = stub.resolves({
  id: 1
});

describe('RequestRepeater instance', function() {
  it('should instantiate with config', function() {
    const requestRepeater = new RequestRepeater({
      request: MOCK_REQUEST,
      delay: CORRECT_CONFIG.API_DELAY
    })
  })

  it('should fail without config', function() {
    assert.throws(function() {
      const requestRepeater = new RequestRepeater()
    }, 'options is not an object')
  })

  it('should fail with request not a function', function() {
    assert.throws(function() {
      const requestRepeater = new RequestRepeater({
        delay: CORRECT_CONFIG.API_DELAY
      })
    }, 'request option is not a function')
  })

  it('should fail with delay not a number', function() {
    assert.throws(function() {
      const requestRepeater = new RequestRepeater({
        request: MOCK_REQUEST,
      })
    }, 'delay option is not a number')
  })
})

describe('RequestRepeater functions', function() {

  // sort of an integration test
  it('should make request and repeat it at least once and it can be stopped', function(done) {
    // if the test did not stop, it meast stopTimer does not work
    const requestRepeater = new RequestRepeater({
      request: MOCK_REQUEST,
      delay: 100
    })
    let times = 0;
    requestRepeater.requestAndRepeat()
    requestRepeater.on('result', (result, error) => {
      times++
      if (times > 1) {
        requestRepeater.stopTimer()
        done()
      }
    })
  })

  it('should emit result', function() {
    const requestRepeater = new RequestRepeater({
      request: MOCK_REQUEST,
      delay: 100
    })
    const TEST_RESULT = 'test'
    let fake = sinon.fake()

    sinon.replace(requestRepeater, 'emit', fake)
    requestRepeater.onResult(TEST_RESULT)

    assert.deepEqual(fake.getCall(0).args, ['result', TEST_RESULT])
  })

  it('should emit error', function() {
    const requestRepeater = new RequestRepeater({
      request: MOCK_REQUEST,
      delay: 100
    })
    const TEST_ERROR = 'test'
    let fake = sinon.fake()

    sinon.replace(requestRepeater, 'emit', fake)
    requestRepeater.onError(TEST_ERROR)

    assert.deepEqual(fake.getCall(0).args, ['result', null, TEST_ERROR])
  })
})
