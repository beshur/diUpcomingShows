'use strict'

const assert = require('chai').assert
const nock = require('nock')
const sinon = require('sinon')
const NotifyHooks = require('../lib/NotifyHooks')
const config = require('../config')

const CORRECT_CONFIG = {
  API_DELAY: config.get('API_DELAY')
}
const stub = sinon.stub()
const MOCK_REQUEST = stub.resolves({
  id: 1
});

