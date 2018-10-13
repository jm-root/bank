const jmss = require('jm-ms-sequlize')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts) {
  const model = service.balance
  let router = ms.router()

  router
    .add('/', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'accountId', 'ctId', 'amount', 'amountValid', 'overdraw', 'amountLocked'])
    })
    .add('/:id', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'accountId', 'ctId', 'amount', 'amountValid', 'overdraw', 'amountLocked'])
    })
    .use(jmss(model))

  return router
}
