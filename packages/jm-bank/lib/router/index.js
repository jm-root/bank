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

const ms = new MS()

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

  routes.query = function (opts = {}) {
    return service.user.query(opts.data)
  }

  routes.transfer = function (opts = {}) {
    const { data } = opts
    return service.user.transfer(data)
  }

  router
    .use(help(service))
    .use(function (opts) {
      if (!service.ready) throw error.err(error.Err.FA_NOTREADY)
    })
    .add('/query', 'get', routes.query)
    .add('/transfer', 'post', routes.transfer)
    .use('/transfers', transfer(service))
    .use('/users', user(service))
    .use('/accounts', account(service))
    .use('/balances', balance(service))
    .use('/cts', ct(service))

  let routerT = ms.router()
  routerT
    .use(opts => {
      return new Promise((resolve, reject) => {
        service.db.transaction(async t => {
          try {
            const doc = await router.request(opts)
            resolve(doc)
          } catch (e) {
            reject(e)
            throw e
          }
        })
      })
    })

  return routerT
}
