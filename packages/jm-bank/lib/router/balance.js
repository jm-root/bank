const jmss = require('jm-ms-sequelize')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts) {
  const model = service.balance
  let router = ms.router()

  router
    .add('/', 'get', async (opts = {}) => {
      const { data = {} } = opts
      data.rows || (data.rows = 100)
    })
    .add('/', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'accountId', 'ctId', 'amount', 'amountValid', 'overdraw'])
    })
    .add('/:id', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'accountId', 'ctId', 'amount', 'amountValid', 'overdraw'])
    })
    .use(jmss(model))

  return router
}
