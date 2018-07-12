const config = require('../config')
const $ = require('../src')

let expect = chai.expect

let log = function (err, doc) {
  if (err) console.error(err.stack)
  if (err.errors) console.error('%j', err.errors)
  if (doc) console.log(doc)
}

let service = $(config)
let userId = 'testUserId'
let ctCode = 'cny'
let ctName = '人民币'

describe('service', () => {
  beforeAll(function (done) {
    service.onReady().then(function () { done() })
  })

  test('user', done => {
    service
      .getUser({userId: userId})
      .then((user) => {
        if (user) {
          return done()
        }
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('ct', done => {
    service.ct
      .find({
        where: {code: ctCode}
      })
      .then((doc) => {
        if (!doc) {
          return service.ct.create({
            code: ctCode,
            name: ctName
          })
        }
        return doc
      })
      .then(function (doc) {
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('query', done => {
    service
      .query({
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

  test('updateAmount', done => {
    service
      .updateAmount({
        accountId: 1,
        ctId: 1,
        amount: -1000
      })
      .then(function (doc) {
        if (!doc) throw new Error('updateAmount fail.')
        expect(doc !== null).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('put', done => {
    service
      .put({
        accountId: 1,
        ctId: 1,
        amount: 1000
      })
      .then(function (doc) {
        if (!doc) throw new Error('put fail.')
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('take', done => {
    service
      .take({
        accountId: 1,
        ctId: 1,
        amount: 2000
      })
      .then(function (doc) {
        if (!doc) throw new Error('take fail.')
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('transfer', done => {
    service
      .trans({
        toAccountId: 1,
        ctId: 1,
        amount: 1000,
        memo: 'test',
        payId: '134'
      })
      .then(function (doc) {
        if (!doc) throw new Error('transfer fail.')
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('transfer by user', done => {
    service
      .transByUser({
        toUserId: userId,
        ctCode: ctCode,
        amount: 1000,
        memo: '测试'
      })
      .then(function (doc) {
        if (!doc) throw new Error('transfer fail.')
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('lock', done => {
    service
      .lock({
        accountId: 1,
        ctId: 1,
        amount: 1000
      })
      .then(function (doc) {
        if (!doc) throw new Error('lock fail.')
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('unlock', done => {
    service
      .unlock({
        accountId: 1,
        ctId: 1,
        amount: 1000
      })
      .then(function (doc) {
        if (!doc) throw new Error('unlock fail.')
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('lock all', done => {
    service
      .lock({
        accountId: 1,
        ctId: 1,
        allAmount: 1
      })
      .then(function (doc) {
        if (!doc) throw new Error('lock fail.')
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('unlock all', done => {
    service
      .unlock({
        accountId: 1,
        ctId: 1,
        allAmount: 1
      })
      .then(function (doc) {
        if (!doc) throw new Error('unlock fail.')
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('lock self', done => {
    service
      .lock({
        fromUserId: userId,
        accountId: 1,
        ctId: 1,
        amount: 1000
      })
      .then(function (doc) {
        if (!doc) throw new Error('lock fail.')
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })

  test('unlock self', done => {
    service
      .unlock({
        fromUserId: userId,
        accountId: 1,
        ctId: 1,
        amount: 1000
      })
      .then(function (doc) {
        if (!doc) throw new Error('unlock fail.')
        expect(doc).to.be.ok
        done()
      })
      .catch(function (err, doc) {
        log(err, doc)
        done()
      })
  })
})
