const jmss = require('jm-ms-sequelize')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts) {
  const model = service.user
  let router = ms.router()

  router
    .add('/', 'get', async (opts = {}) => {
      const { data = {} } = opts
      data.rows || (data.rows = 100)
    })
    .add('/', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'accountId', 'safeAccountId', 'name', 'status'])
      let data = opts.data
      opts.conditions || (opts.conditions = {})
      if (data.userId) {
        opts.conditions.id = data.userId
      }
    })
    .add('/:id', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'accountId', 'safeAccountId', 'name', 'status'])
    })
    .use(jmss(model))

  return router
}
