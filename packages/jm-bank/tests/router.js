const config = require('../config')
const $ = require('../src')

let expect = chai.expect

let log = function (err, doc) {
  if (err) console.error(err.stack)
  if (err.errors) console.error('%j', err.errors)
  if (doc) console.log(doc)
}

let service = $(config)
let router = service.router()
let userId = 'testUserId'
let ctCode = 'cny'
let ctName = '人民币'

describe('router', () => {
  beforeAll(function (done) {
    service.onReady().then(function () { done() })
  })

  test('query', done => {
    router
      .get('/query',
        {
          userId: userId,
          ctCode: ctCode
        })
      .then(function (doc) {
        if (!doc) throw new Error('query fail.')
        expect(doc).to.be.ok
        console.log('%j', doc)
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('transfer by user', done => {
    router
      .post('/transfer', {
        toUserId: userId,
        ctCode: ctCode,
        amount: 1000,
        memo: '测试'
      })
      .then(function (doc) {
        expect(doc).to.be.ok
        console.log('%j', doc)
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('lock', done => {
    router
      .post('/lock', {
        userId: userId,
        ctCode: ctCode,
        amount: 1000,
        memo: '测试'
      })
      .then(function (doc) {
        expect(doc).to.be.ok
        console.log('%j', doc)
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('unlock', done => {
    router
      .post('/unlock', {
        userId: userId,
        ctCode: ctCode,
        amount: 1000,
        memo: '测试'
      })
      .then(function (doc) {
        expect(doc).to.be.ok
        console.log('%j', doc)
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })
})
