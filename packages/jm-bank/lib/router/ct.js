const jmss = require('jm-ms-sequelize')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts) {
  const model = service.ct
  let router = ms.router()

  router
    .add('/', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'code', 'name'])
    })
    .add('/:id', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'code', 'name'])
    })
    .use(jmss(model))

  return router
}
