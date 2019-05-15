'use strict'
  
const _ = require('underscore')
const assert = require('chai').assert
const sinon = require('sinon')
const config = require('../config')
const NotificationFactory = require('../lib/NotificationFactory')

const hooks = config.get('KEYS_HOOKS')
const SCHEDULE_OPTIONS = {
  show: {
    id: 2,
    name: 'Test Show',
    artist_tagline: 'with test engines',
    show: {
      id: 1,
      channels: [{
        key: 'trance'
      }]
    }
  },
  hooks,
  delay: 100
}
const mockDate = new Date()
var log = function() {
  console.log(...arguments)
}

let bodyGeneratorMock = {
  generate: () => {
    return {
      content: 'Test message'
  }}
}

function NotificationTimerApi(options) {
  this.id = options.id
  this.clear = () => {}
  this.report = () => {
    return {
      id: options.id,
      createdAt: mockDate,
      delay: options.delay
    }
  }
  return this
}

function NotifyHooksApi() {
  this.notify = () => {}
  return this
}

// tmp

const CORRECT_CONFIG = {
  log: log,
  NotificationTimer: NotificationTimerApi,
  NotifyHooks: NotifyHooksApi,
  notificationPayloadGenerator: bodyGeneratorMock
}

describe('NotificationFactory instance', function() {
  it('should instantiate with config', function() {
      const notificationFactory = new NotificationFactory(CORRECT_CONFIG)
      assert(notificationFactory instanceof NotificationFactory)
  })

  it('should fail without config', function() {
    assert.throws(function() {
      new NotificationFactory()
    }, 'options is not a object')
  })

})


describe('NotificationFactory functions', function() {
  const originalLog = log
  let notificationFactory
  let schedule_options
  let logStack = []

  beforeEach(function() {
    logStack = []
    log = function() {
      logStack.push([...arguments])
    }
    CORRECT_CONFIG.log = log
    notificationFactory = new NotificationFactory(CORRECT_CONFIG)
    schedule_options = _.clone(SCHEDULE_OPTIONS)
  });

  afterEach(function() {
    notificationFactory.destroy()
    notificationFactory = null
    schedule_options = null

    log = originalLog; // undo dummy log function
    if (this.currentTest.state === 'failed') {
      logStack.forEach(line => log.apply(this, line))
    }
  });

  it('should schedule a notification', function() {
    assert.equal(notificationFactory.schedule(schedule_options),
      schedule_options.show.id, 'Wrong show id returned')
  })

  it('should not schedule a notification if it was already', function() {
    notificationFactory.schedule(schedule_options)
    assert.equal(notificationFactory.schedule(schedule_options),
      0, 'Expected 0 meaning it was not scheduled')
  })

  it('should not schedule a notification with falsy params', function() {
    let incorrect_config = _.extend({}, CORRECT_CONFIG, {
      NotifyHooks: sinon.fake.throws('Wrong params')
    })
    let notificationFactoryCustom = new NotificationFactory(incorrect_config)
    delete schedule_options.hooks

    assert.equal(notificationFactoryCustom.schedule(schedule_options),
      0, 'Expected 0 meaning it was not scheduled')
  })


  it('should not schedule a timer with falsy params', function() {
    let incorrect_config = _.extend({}, CORRECT_CONFIG, {
      NotificationTimer: sinon.fake.throws('Wrong params')
    })
    let notificationFactoryCustom = new NotificationFactory(incorrect_config)
    delete schedule_options.delay

    assert.equal(notificationFactoryCustom.schedule(schedule_options),
      0, 'Expected 0 meaning it was not scheduled')
  })

  it('should report scheduled notifications', function() {
    notificationFactory.schedule(schedule_options)

    assert.deepEqual(notificationFactory.report(),
      [{
        id: schedule_options.show.id,
        createdAt: mockDate,
        delay: schedule_options.delay
      }], 'Wrong report is returned')
  })

  it('should destroy scheduled notifications', function() {
    notificationFactory.schedule(schedule_options)
    notificationFactory.destroy()

    assert.deepEqual(notificationFactory.report(),
      [], 'Empty report is expected')
  })
})

