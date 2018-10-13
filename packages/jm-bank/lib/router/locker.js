const jmss = require('jm-ms-sequlize')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts) {
  const model = service.locker
  let router = ms.router()

  router
    .add('/', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'fromUserId', 'balanceId', 'amount', 'moditime'])
    })
    .add('/:id', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'fromUserId', 'balanceId', 'amount', 'moditime'])
    })
    .use(jmss(model))

  return router
}
