'use strict'

const _ = require('underscore')
const assert = require('chai').assert
const sinon = require('sinon')
const config = require('../config')
const moment = require('moment')
const ShowsParser = require('../lib/ShowsParser')

const hooks = config.get('KEYS_HOOKS')

const notificationFactoryApi = {
  schedule: () => {}
}

const postThrottlerApi = {
  throttle: () => false
}

var log = function() {
  console.log(...arguments)
}

describe('ShowsParser instance', function() {
  let notificationFactoryMock = sinon.mock(_.clone(notificationFactoryApi))
  let postThrottlerMock = sinon.mock(_.clone(postThrottlerApi))
  const originalLog = log
  var correctConfig = {}
  let logStack = []

  beforeEach(function() {
    logStack = []
    log = function() {
      logStack.push([...arguments])
    }
    correctConfig = {
      log,
      notificationFactory: notificationFactoryMock,
      keysHooks: hooks,
      notifyBefore: config.get('NOTIFY_BEFORE'),
      delay: config.get('API_DELAY'),
      postThrottler: postThrottlerMock
    }
  });

  afterEach(function() {
    log = originalLog;
    if (this.currentTest.state === 'failed') {
      logStack.forEach(line => log.apply(this, line))
    }
  });

  it('should instantiate with config', function() {
      const showsParser = new ShowsParser(correctConfig)
      assert(showsParser instanceof ShowsParser)
  })

  it('should fail without config', function() {
    assert.throws(function() {
      new ShowsParser()
    }, 'options is not an object')
  })

  it('should fail without log option', function() {
    let localConfig = _.extend({}, correctConfig, {
      log: ''
    })
    assert.throws(function() {
      new ShowsParser(localConfig)
    }, 'log option is not a function')
  })

  it('should fail without notificationFactory option', function() {
    let localConfig = _.extend({}, correctConfig, {
      notificationFactory: ''
    })
    assert.throws(function() {
      new ShowsParser(localConfig)
    }, 'notificationFactory option is not an object')
  })

  it('should fail without keysHooks option', function() {
    let localConfig = _.extend({}, correctConfig, {
      keysHooks: ''
    })
    assert.throws(function() {
      new ShowsParser(localConfig)
    }, 'keysHooks option is not an object')
  })

  it('should fail without notifyBefore option', function() {
    let localConfig = _.extend({}, correctConfig, {
       notifyBefore: ''
    })
    assert.throws(function() {
      new ShowsParser(localConfig)
    }, 'notifyBefore option is not a number')
  })

  it('should fail without delay option', function() {
    let localConfig = _.extend({}, correctConfig, {
       delay: ''
    })
    assert.throws(function() {
      new ShowsParser(localConfig)
    }, 'delay option is not a number')
  })

  it('should fail without postThrottler option', function() {
    let localConfig = _.extend({}, correctConfig, {
       postThrottler: ''
    })
    assert.throws(function() {
      new ShowsParser(localConfig)
    }, 'postThrottler option is not an object')
  })

})


describe('ShowsParser functions', function() {
  const originalLog = log
  var correctConfig = {}
  let logStack = []
  let upcomingShows
  let upcomingShowsStr
  let notificationFactory
  let notificationFactoryMock
  let postThrottler
  let postThrottlerMock

  beforeEach(function() {
    notificationFactory = _.clone(notificationFactoryApi)
    notificationFactoryMock = sinon.mock(notificationFactory)
    postThrottler = _.clone(postThrottlerApi)
    postThrottlerMock = sinon.mock(postThrottler)
    logStack = []
    log = function() {
      logStack.push([...arguments])
    }
    correctConfig = {
      log,
      notificationFactory: notificationFactory,
      keysHooks: hooks,
      notifyBefore: 60000,
      delay: 3600000,
      postThrottler: postThrottler
    }
    upcomingShows = [{
      id: 2,
      name: 'This fantastic show',
      artist_tagline: 'with test engine',
      start_at: moment().add(5, 'minutes').format(),
      show: {
        id: 1,
        channels: [{
          key: 'trance'
        }]
      }
    }]
  });

  afterEach(function() {
    log = originalLog;
    if (this.currentTest.state === 'failed') {
      logStack.forEach(line => log.apply(this, line))
    }
  });


  it('should trigger show scheduling', function() {
    const showsParser = new ShowsParser(correctConfig)
    upcomingShowsStr = JSON.stringify(upcomingShows)
    notificationFactoryMock.expects('schedule').once()

    showsParser.onUpcomingShows(upcomingShowsStr)
    assert(notificationFactoryMock.verify(), 'notificationFactory.schedule was not called')
  })

  it('should not trigger show scheduling if it is in 30s or less' , function() {
    const showsParser = new ShowsParser(correctConfig)
    upcomingShows[0].start_at = moment().add(correctConfig.notifyBefore/2, 's').format()
    upcomingShowsStr = JSON.stringify(upcomingShows)
    notificationFactoryMock.expects('schedule').never()
    
    showsParser.onUpcomingShows(upcomingShowsStr)
    assert(notificationFactoryMock.verify(), 'notificationFactory.schedule was called')
  })

  it('should not trigger show scheduling if it is in 1h 31s or more' , function() {
    const showsParser = new ShowsParser(correctConfig)
    upcomingShows[0].start_at = moment().add(60*60+1+correctConfig.notifyBefore/2, 's').format()
    upcomingShowsStr = JSON.stringify(upcomingShows)
    notificationFactoryMock.expects('schedule').never()
    
    showsParser.onUpcomingShows(upcomingShowsStr)
    assert(notificationFactoryMock.verify(), 'notificationFactory.schedule was called')
  })

  it('should not trigger show scheduling if there isn\'t a proper hook'  , function() {
    const showsParser = new ShowsParser(correctConfig)
    upcomingShows[0].show.channels[0].key = ''
    upcomingShowsStr = JSON.stringify(upcomingShows)
    notificationFactoryMock.expects('schedule').never()
    
    showsParser.onUpcomingShows(upcomingShowsStr)
    assert(notificationFactoryMock.verify(), 'notificationFactory.schedule was called')
  })
})

