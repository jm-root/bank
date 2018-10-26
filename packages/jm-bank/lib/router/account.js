const jmss = require('jm-ms-sequlize')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts) {
  const model = service.account
  let router = ms.router()

  router
    .add('/', 'get', async (opts = {}) => {
      const {data = {}} = opts
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
