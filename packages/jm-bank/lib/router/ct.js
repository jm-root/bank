const jmss = require('jm-ms-sequlize')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts) {
  const model = service.ct
  let router = ms.router()

  router
    .add('/', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'code', 'name', 'status'])
    })
    .add('/:id', 'get', opts => {
      opts.fields || (opts.fields = ['id', 'code', 'name', 'status'])
    })
    .use(jmss(model))

  return router
}
