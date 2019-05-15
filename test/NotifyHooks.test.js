'use strict'

const assert = require('chai').assert
const nock = require('nock')
const config = require('../config')
const NotifyHooks = require('../lib/NotifyHooks')

const FAKE_HOST = 'https://fake.discordapp.com'
const hooks = config.get('KEYS_HOOKS').trance
let bodyGeneratorMock = {
  generate: () => {
    return {
      content: 'Test message'
  }}
}

const CORRECT_CONFIG = {
  show: {
    id: 2,
    slug: '2019-05-14',
    artists_tagline: 'with Floating Points',
    show: {
      id: 1,
      slug: 'slowshow',
      name: 'Slow Show'
    }
  },
  hooks: hooks,
  bodyGenerator: bodyGeneratorMock
}

describe('NotifyHooks instance', function() {
  it('should instantiate with config', function() {
      const notifyHooks = new NotifyHooks(CORRECT_CONFIG)
      assert(notifyHooks instanceof NotifyHooks)
  })

  it('should fail without config', function() {
    assert.throws(function() {
      new NotifyHooks()
    }, 'options is not an object')
  })

  it('should fail without show option', function() {
    assert.throws(function() {
      new NotifyHooks({
        hooks: [],
        bodyGenerator: {}
      })
    }, 'show option is not an object')
  })

  it('should fail without hooks option', function() {
    assert.throws(function() {
      new NotifyHooks({
        show: {},
        bodyGenerator: {}
      })
    }, 'hooks option is not an Array')
  })

  it('should fail without bodyGenerator option', function() {
    assert.throws(function() {
      new NotifyHooks({
        show: {},
        hooks: []
      })
    }, 'bodyGenerator option is not an object')
  })
})


describe('NotifyHooks functions', function() {
  it('should notify all hooks', function(done) {
    const notifyHooks = new NotifyHooks(CORRECT_CONFIG)
    nock(FAKE_HOST)
      .persist()
      .post(/\b(webhooks)\b/)
      .reply(200, 'ok')

    notifyHooks.notify()
      .then(() => {
        done()
      })
      .catch(done)
  })
})

