const event = require('jm-event')
const error = require('jm-err')
const MS = require('jm-ms-core')
const wrapper = require('jm-ms-wrapper')
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
  wrapper(service.t)(router)

  service.routes || (service.routes = {})
  let routes = service.routes
  event.enableEvent(routes)

  routes.query = async function (opts = {}) {
    return service.query(opts.data)
  }

  routes.transfer = async function (opts = {}) {
    const {data} = opts
    const {fromUserId, toUserId} = data
    let p = null
    if (fromUserId || toUserId) {
      p = service.transByUser(data)
    } else {
      p = service.trans(data)
    }

    const doc = await p

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
    fromUserId && (o.fromUserId = fromUserId)
    toUserId && (o.toUserId = toUserId)
    service.emit('transfer', o)

    return doc
  }

  routes.lock = async function (opts = {}) {
    const {data} = opts
    let {ctId, ctCode, userId, fromUserId, accountId, amount} = data

    if (!ctId) {
      const ct = await service.validCT({code: ctCode})
      ctId = ct.id
      data.ctId = ctId
    }

    if (!accountId) {
      const account = await service.user.getDefaultAccount(userId)
      accountId = account.id
      data.accountId = accountId
    }

    let doc = await service.lock(data)

    doc = {
      fromUserId,
      accountId,
      ctId,
      amount,
      totalAmount: doc.locker.amount
    }

    return doc
  }

  routes.unlock = async function (opts = {}) {
    const {data} = opts
    let {ctId, ctCode, userId, fromUserId, accountId, amount} = data

    if (!ctId) {
      const ct = await service.validCT({code: ctCode})
      ctId = ct.id
      data.ctId = ctId
    }

    if (!accountId) {
      const account = await service.user.getDefaultAccount(userId)
      accountId = account.id
      data.accountId = accountId
    }

    let doc = await service.unlock(data)

    doc = {
      fromUserId,
      accountId,
      ctId,
      amount,
      totalAmount: doc.locker.amount
    }

    return doc
  }

  router
    .use(help(service))
    .use(function (opts) {
      if (!service.ready) throw error.err(error.Err.FA_NOTREADY)
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

  let routerT = ms.router()
  routerT
    .use(async opts => {
      return new Promise((resolve, reject) => {
        service.db.transaction(async t => {
          try {
            const doc = await router.request(opts)
            resolve(doc)
          } catch (e) {
            reject(e)
          }
        })
      })
    })

  return routerT
}
