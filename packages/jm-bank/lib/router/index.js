const event = require('jm-event')
const error = require('jm-err')
const MS = require('jm-ms-core')
const help = require('./help')
const transfer = require('./transfer')
const user = require('./user')
const account = require('./account')
const balance = require('./balance')
const ct = require('./ct')
const locker = require('./locker')

let Err = error.Err
let ms = new MS()

/**
 * @apiDefine Error
 *
 * @apiSuccess (Error 200) {Number} err 错误代码
 * @apiSuccess (Error 200) {String} msg 错误信息
 *
 * @apiExample {json} 错误:
 *     {
 *       err: 错误代码
 *       msg: 错误信息
 *     }
 */

module.exports = function (opts = {}) {
  let service = this
  let router = ms.router()

  service.routes || (service.routes = {})
  let routes = service.routes
  event.enableEvent(routes)

  let t = function (doc, lng) {
    if (doc && lng && doc.err && doc.msg) {
      return {
        err: doc.err,
        msg: service.t(doc.msg, lng) || Err.t(doc.msg, lng) || doc.msg
      }
    }
    return doc
  }

  let onerr = (err) => {
    return {
      err: err.code || Err.FAIL.err,
      msg: err.message
    }
  }

  routes.query = function (opts = {}, cb, next) {
    return service.db
      .transaction(function (t) {
        return service.query(opts.data)
      })
      .then(function (doc) {
        cb(null, doc)
      })
      .catch(function (err) {
        let doc = onerr(err)
        doc = t(doc, opts.lng)
        cb(err, doc)
      })
  }

  routes.transfer = function (opts = {}, cb, next) {
    let data = opts.data
    return service.db
      .transaction(function (t) {
        if (data.fromUserId || data.toUserId) {
          return service.transByUser(data)
        } else {
          return service.trans(data)
        }
      })
      .then(function (doc) {
        cb(null, doc)
        let o = {
          id: doc.id,
          amount: doc.amount,
          memo: doc.memo,
          ctId: doc.ctId,
          crtime: doc.crtime
        }
        if (doc.fromAccountId) {
          o.fromAccountId = doc.fromAccountId
          o.fromAccountBalance = doc.fromAccountBalance
        }
        if (doc.toAccountId) {
          o.toAccountId = doc.toAccountId
          o.toAccountBalance = doc.toAccountBalance
        }
        data.fromUserId && (o.fromUserId = data.fromUserId)
        data.toUserId && (o.toUserId = data.toUserId)
        service.emit('transfer', o)
      })
      .catch(function (err) {
        let doc = onerr(err)
        doc = t(doc, opts.lng)
        cb(err, doc)
      })
  }

  routes.lock = function (opts = {}, cb, next) {
    return service.db
      .transaction(function (t) {
        let data = opts.data
        return service
          .validCT({code: data.ctCode})
          .then(function (ct) {
            data.ctId = ct.id
            if (!data.accountId) {
              return service
                .getDefaultAccount({userId: data.userId})
                .then(function (account) {
                  data.accountId = account.id
                })
            }
            return data
          })
          .then(function () {
            return service.lock(opts.data)
          })
      })
      .then(function (doc) {
        let data = opts.data
        doc = {
          fromUserId: data.fromUserId,
          accountId: data.accountId,
          ctId: data.ctId,
          amount: data.amount,
          totalAmount: Number(doc.locker.amount)
        }
        cb(null, doc)
      })
      .catch(function (err) {
        let doc = onerr(err)
        doc = t(doc, opts.lng)
        cb(err, doc)
      })
  }

  routes.unlock = function (opts = {}, cb, next) {
    return service.db
      .transaction(function (t) {
        let data = opts.data
        return service
          .validCT({code: data.ctCode})
          .then(function (ct) {
            data.ctId = ct.id
            if (!data.accountId) {
              return service
                .getDefaultAccount({userId: data.userId})
                .then(function (account) {
                  data.accountId = account.id
                })
            }
            return data
          })
          .then(function () {
            return service.unlock(opts.data)
          })
      })
      .then(function (doc) {
        let data = opts.data
        doc = {
          fromUserId: data.fromUserId,
          accountId: data.accountId,
          ctId: data.ctId,
          amount: data.amount,
          totalAmount: Number(doc.locker.amount)
        }
        cb(null, doc)
      })
      .catch(function (err) {
        let doc = onerr(err)
        doc = t(doc, opts.lng)
        cb(err, doc)
      })
  }

  router
    .use(help(service))
    .use(function (opts, cb, next) {
      if (!service.ready) return cb(null, error.Err.FA_NOTREADY)
      next()
    })
    .add('/query', 'get', routes.query)
    .add('/transfer', 'post', routes.transfer)
    .add('/lock', 'post', routes.lock)
    .add('/unlock', 'post', routes.unlock)
    .use('/transfers', transfer(service))
    .use('/users', user(service))
    .use('/accounts', account(service))
    .use('/balances', balance(service))
    .use('/cts', ct(service))
    .use('/lockers', locker(service))

  return router
}
