const jmss = require('jm-ms-sequelize')
const { ms } = require('jm-server')

module.exports = function (service) {
  const model = service.account
  const router = ms.router()

  router
    .add('/', 'get', async (opts = {}) => {
      const { data = {} } = opts
      data.rows || (data.rows = 100)
    })
    .add('/', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'userId', 'name', 'status'])
    })
    .add('/:id', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'userId', 'name', 'status'])
    })
    .use(jmss(model))

  return router
}
