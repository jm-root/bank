const { ms } = require('jm-server')
const transfer = require('./transfer')
const user = require('./user')
const account = require('./account')
const balance = require('./balance')
const ct = require('./ct')

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

module.exports = function (service) {
  const router = ms.router()

  router
    .add('/query', 'get', (opts = {}) => {
      return service.user.query(opts.data)
    })
    .add('/transfer', 'post', (opts = {}) => {
      const { data } = opts
      return service.user.transfer(data)
    })
    .use('/transfers', transfer(service))
    .use('/users', user(service))
    .use('/accounts', account(service))
    .use('/balances', balance(service))
    .use('/cts', ct(service))

  const routerT = ms.router()
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
