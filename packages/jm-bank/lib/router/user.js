const jmss = require('jm-ms-sequelize')
const { ms } = require('jm-server')

module.exports = function (service) {
  const model = service.user
  const router = ms.router()

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
